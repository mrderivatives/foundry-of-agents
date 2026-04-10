package handler

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
)

type documentRow struct {
	ID          uuid.UUID  `json:"id"`
	WorkspaceID uuid.UUID  `json:"workspace_id"`
	UploadedBy  *uuid.UUID `json:"uploaded_by"`
	Filename    *string    `json:"filename"`
	MimeType    *string    `json:"mime_type"`
	SizeBytes   *int64     `json:"size_bytes"`
	StorageKey  *string    `json:"storage_key"`
	Status      string     `json:"status"`
	PageCount   *int       `json:"page_count"`
	TotalChunks *int       `json:"total_chunks"`
	CreatedAt   time.Time  `json:"created_at"`
}

// POST /api/documents
func (h *Handler) handleCreateDocument(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())
	ctx := r.Context()

	var body struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}
	if err := readJSON(r, &body); err != nil || strings.TrimSpace(body.Title) == "" || strings.TrimSpace(body.Content) == "" {
		errJSON(w, http.StatusBadRequest, "title and content are required")
		return
	}

	// Chunk content into ~500-word chunks
	words := strings.Fields(body.Content)
	chunkSize := 500
	var chunks []string
	for i := 0; i < len(words); i += chunkSize {
		end := i + chunkSize
		if end > len(words) {
			end = len(words)
		}
		chunks = append(chunks, strings.Join(words[i:end], " "))
	}

	mimeType := "text/plain"
	storageKey := "inline"
	sizeBytes := int64(len(body.Content))
	totalChunks := len(chunks)

	// Insert document
	var doc documentRow
	err := h.DB.QueryRow(ctx,
		`INSERT INTO document (workspace_id, uploaded_by, filename, mime_type, size_bytes, storage_key, status, total_chunks)
		 VALUES ($1, $2, $3, $4, $5, $6, 'ready', $7)
		 RETURNING id, workspace_id, uploaded_by, filename, mime_type, size_bytes, storage_key, status, page_count, total_chunks, created_at`,
		wsID, userID, body.Title, mimeType, sizeBytes, storageKey, totalChunks).Scan(
		&doc.ID, &doc.WorkspaceID, &doc.UploadedBy, &doc.Filename, &doc.MimeType,
		&doc.SizeBytes, &doc.StorageKey, &doc.Status, &doc.PageCount, &doc.TotalChunks, &doc.CreatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to insert document")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	// Insert chunks
	for i, chunk := range chunks {
		_, err := h.DB.Exec(ctx,
			`INSERT INTO document_chunk (document_id, workspace_id, content, chunk_index)
			 VALUES ($1, $2, $3, $4)`,
			doc.ID, wsID, chunk, i)
		if err != nil {
			h.Logger.Error().Err(err).Int("chunk_index", i).Msg("failed to insert document chunk")
		}
	}

	writeJSON(w, http.StatusCreated, doc)
}

// GET /api/documents
func (h *Handler) handleListDocuments(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, workspace_id, uploaded_by, filename, mime_type, size_bytes, storage_key, status, page_count, total_chunks, created_at
		 FROM document WHERE workspace_id = $1 ORDER BY created_at DESC`, wsID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list documents")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	docs := []documentRow{}
	for rows.Next() {
		var d documentRow
		if err := rows.Scan(&d.ID, &d.WorkspaceID, &d.UploadedBy, &d.Filename, &d.MimeType,
			&d.SizeBytes, &d.StorageKey, &d.Status, &d.PageCount, &d.TotalChunks, &d.CreatedAt); err != nil {
			h.Logger.Error().Err(err).Msg("failed to scan document")
			errJSON(w, http.StatusInternalServerError, "internal error")
			return
		}
		docs = append(docs, d)
	}

	writeJSON(w, http.StatusOK, docs)
}

// DELETE /api/documents/{docId}
func (h *Handler) handleDeleteDocument(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	docID, err := uuid.Parse(chi.URLParam(r, "docId"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid document id")
		return
	}

	tag, err := h.DB.Exec(r.Context(),
		`DELETE FROM document WHERE id = $1 AND workspace_id = $2`, docID, wsID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to delete document")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	if tag.RowsAffected() == 0 {
		errJSON(w, http.StatusNotFound, "document not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// POST /api/documents/upload
func (h *Handler) handleUploadDocument(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())

	// Max 10MB
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		errJSON(w, http.StatusBadRequest, "file too large or invalid multipart form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		errJSON(w, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	title := r.FormValue("title")
	if title == "" {
		title = header.Filename
	}

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		errJSON(w, http.StatusBadRequest, "failed to read file")
		return
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	mimeType := header.Header.Get("Content-Type")

	var extractedText string
	var pageCount int

	switch {
	case ext == ".pdf":
		extractedText, pageCount, err = extractPDF(fileBytes)
	case ext == ".txt" || ext == ".md" || ext == ".csv":
		extractedText = string(fileBytes)
	case ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".webp":
		extractedText, err = h.extractImage(r.Context(), fileBytes, mimeType)
	default:
		errJSON(w, http.StatusBadRequest, "unsupported file type: "+ext)
		return
	}

	if err != nil {
		h.Logger.Error().Err(err).Str("filename", header.Filename).Msg("extraction failed")
		errJSON(w, http.StatusInternalServerError, "failed to extract text: "+err.Error())
		return
	}

	chunks := chunkText(extractedText, 500)

	ctx := r.Context()
	var doc documentRow
	var pageCountPtr *int
	if pageCount > 0 {
		pageCountPtr = &pageCount
	}
	err = h.DB.QueryRow(ctx,
		`INSERT INTO document (workspace_id, uploaded_by, filename, mime_type, size_bytes, storage_key, status, page_count, total_chunks)
		 VALUES ($1, (SELECT user_id FROM member WHERE workspace_id = $1 LIMIT 1), $2, $3, $4, 'inline', 'ready', $5, $6)
		 RETURNING id, workspace_id, uploaded_by, filename, mime_type, size_bytes, storage_key, status, page_count, total_chunks, created_at`,
		wsID, title, mimeType, int64(len(fileBytes)), pageCountPtr, len(chunks)).Scan(
		&doc.ID, &doc.WorkspaceID, &doc.UploadedBy, &doc.Filename, &doc.MimeType,
		&doc.SizeBytes, &doc.StorageKey, &doc.Status, &doc.PageCount, &doc.TotalChunks, &doc.CreatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to insert document")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	for i, chunk := range chunks {
		_, err := h.DB.Exec(ctx,
			`INSERT INTO document_chunk (document_id, workspace_id, content, chunk_index)
			 VALUES ($1, $2, $3, $4)`,
			doc.ID, wsID, chunk, i)
		if err != nil {
			h.Logger.Error().Err(err).Int("chunk", i).Msg("failed to insert chunk")
		}
	}

	writeJSON(w, http.StatusCreated, doc)
}

func extractPDF(data []byte) (string, int, error) {
	tmp, err := os.CreateTemp("", "upload-*.pdf")
	if err != nil {
		return "", 0, err
	}
	defer os.Remove(tmp.Name())
	tmp.Write(data)
	tmp.Close()

	out, err := exec.Command("pdftotext", "-layout", tmp.Name(), "-").Output()
	if err != nil {
		return "", 0, fmt.Errorf("pdftotext: %w", err)
	}

	text := string(out)
	pages := strings.Count(text, "\f") + 1

	return text, pages, nil
}

func (h *Handler) extractImage(ctx context.Context, data []byte, mimeType string) (string, error) {
	if mimeType == "" {
		mimeType = "image/jpeg"
	}
	encoded := base64.StdEncoding.EncodeToString(data)

	reqBody, _ := json.Marshal(map[string]interface{}{
		"model":      "claude-sonnet-4-6",
		"max_tokens": 2048,
		"messages": []map[string]interface{}{
			{
				"role": "user",
				"content": []map[string]interface{}{
					{
						"type": "image",
						"source": map[string]interface{}{
							"type":       "base64",
							"media_type": mimeType,
							"data":       encoded,
						},
					},
					{
						"type": "text",
						"text": "Extract all text visible in this image. If it's a document, transcribe it faithfully. If it's a photo or diagram, describe what you see in detail. Return the extracted/described content only, no commentary.",
					},
				},
			},
		},
	})

	apiKey := os.Getenv("ANTHROPIC_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("ANTHROPIC_API_KEY not set for image extraction")
	}

	req, _ := http.NewRequestWithContext(ctx, "POST", "https://api.anthropic.com/v1/messages", bytes.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("anthropic vision error %d: %s", resp.StatusCode, string(b))
	}

	var result struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	if len(result.Content) > 0 {
		return result.Content[0].Text, nil
	}
	return "", fmt.Errorf("no content in vision response")
}

func chunkText(text string, wordsPerChunk int) []string {
	words := strings.Fields(text)
	if len(words) == 0 {
		return nil
	}
	var chunks []string
	for i := 0; i < len(words); i += wordsPerChunk {
		end := i + wordsPerChunk
		if end > len(words) {
			end = len(words)
		}
		chunks = append(chunks, strings.Join(words[i:end], " "))
	}
	return chunks
}
