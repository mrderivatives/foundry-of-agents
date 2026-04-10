package handler

import (
	"net/http"
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
		 RETURNING id, workspace_id, uploaded_by, filename, mime_type, size_bytes, storage_key, status, total_chunks, created_at`,
		wsID, userID, body.Title, mimeType, sizeBytes, storageKey, totalChunks).Scan(
		&doc.ID, &doc.WorkspaceID, &doc.UploadedBy, &doc.Filename, &doc.MimeType,
		&doc.SizeBytes, &doc.StorageKey, &doc.Status, &doc.TotalChunks, &doc.CreatedAt)
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
		`SELECT id, workspace_id, uploaded_by, filename, mime_type, size_bytes, storage_key, status, total_chunks, created_at
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
			&d.SizeBytes, &d.StorageKey, &d.Status, &d.TotalChunks, &d.CreatedAt); err != nil {
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
