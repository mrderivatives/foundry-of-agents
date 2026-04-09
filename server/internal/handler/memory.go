package handler

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/bifrost"
)

type memoryRow struct {
	ID              uuid.UUID  `json:"id"`
	AgentID         uuid.UUID  `json:"agent_id"`
	WorkspaceID     uuid.UUID  `json:"workspace_id"`
	Content         string     `json:"content"`
	MemoryType      string     `json:"memory_type"`
	EntityName      *string    `json:"entity_name,omitempty"`
	EntityType      *string    `json:"entity_type,omitempty"`
	ImportanceScore float64    `json:"importance_score"`
	SourceType      *string    `json:"source_type,omitempty"`
	SourceID        *string    `json:"source_id,omitempty"`
	Tags            []string   `json:"tags,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

// GET /api/agents/{id}/memory
func (h *Handler) handleListMemory(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	memType := r.URL.Query().Get("type")

	var query string
	var args []interface{}
	if memType != "" {
		query = `SELECT id, agent_id, workspace_id, content, memory_type, entity_name, entity_type,
		         importance_score, source_type, source_id, tags, created_at
		         FROM memory_entry WHERE agent_id = $1 AND workspace_id = $2 AND memory_type = $3
		         ORDER BY created_at DESC LIMIT 50`
		args = []interface{}{agentID, wsID, memType}
	} else {
		query = `SELECT id, agent_id, workspace_id, content, memory_type, entity_name, entity_type,
		         importance_score, source_type, source_id, tags, created_at
		         FROM memory_entry WHERE agent_id = $1 AND workspace_id = $2
		         ORDER BY created_at DESC LIMIT 50`
		args = []interface{}{agentID, wsID}
	}

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list memories")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	memories := []memoryRow{}
	for rows.Next() {
		var m memoryRow
		if err := rows.Scan(&m.ID, &m.AgentID, &m.WorkspaceID, &m.Content, &m.MemoryType,
			&m.EntityName, &m.EntityType, &m.ImportanceScore, &m.SourceType, &m.SourceID,
			&m.Tags, &m.CreatedAt); err != nil {
			h.Logger.Error().Err(err).Msg("failed to scan memory")
			continue
		}
		memories = append(memories, m)
	}
	writeJSON(w, http.StatusOK, memories)
}

// POST /api/agents/{id}/memory
func (h *Handler) handleCreateMemory(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	var body struct {
		Content    string   `json:"content"`
		MemoryType string   `json:"memory_type"`
		Tags       []string `json:"tags"`
	}
	if err := readJSON(r, &body); err != nil || strings.TrimSpace(body.Content) == "" {
		errJSON(w, http.StatusBadRequest, "content is required")
		return
	}
	if body.MemoryType == "" {
		body.MemoryType = "semantic"
	}

	var m memoryRow
	err = h.DB.QueryRow(r.Context(),
		`INSERT INTO memory_entry (agent_id, workspace_id, content, memory_type, source_type, tags)
		 VALUES ($1, $2, $3, $4, 'manual', $5)
		 RETURNING id, agent_id, workspace_id, content, memory_type, entity_name, entity_type,
		           importance_score, source_type, source_id, tags, created_at`,
		agentID, wsID, body.Content, body.MemoryType, body.Tags).Scan(
		&m.ID, &m.AgentID, &m.WorkspaceID, &m.Content, &m.MemoryType,
		&m.EntityName, &m.EntityType, &m.ImportanceScore, &m.SourceType, &m.SourceID,
		&m.Tags, &m.CreatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to create memory")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	writeJSON(w, http.StatusCreated, m)
}

// DELETE /api/agents/{id}/memory/{memId}
func (h *Handler) handleDeleteMemory(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	memID, err := uuid.Parse(chi.URLParam(r, "memId"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid memory id")
		return
	}

	tag, err := h.DB.Exec(r.Context(),
		`DELETE FROM memory_entry WHERE id = $1 AND workspace_id = $2`, memID, wsID)
	if err != nil || tag.RowsAffected() == 0 {
		errJSON(w, http.StatusNotFound, "memory not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// retrieveMemories fetches relevant memories for injection into agent context.
// Returns formatted string for system prompt injection.
func (h *Handler) retrieveMemories(ctx context.Context, agentID uuid.UUID, userMessage string) string {
	var parts []string

	// 1. Recent episodic memories (last 5)
	rows, err := h.DB.Query(ctx,
		`SELECT content FROM memory_entry
		 WHERE agent_id = $1 AND memory_type = 'episodic'
		 ORDER BY created_at DESC LIMIT 5`, agentID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var content string
			if rows.Scan(&content) == nil {
				parts = append(parts, "- "+content)
			}
		}
	}

	// 2. All semantic/identity/user_context memories (load all, cap at 20)
	// For early-stage agents with few memories, keyword search is too restrictive.
	// Load all semantic memories and let the LLM decide relevance.
	srows, serr := h.DB.Query(ctx,
		`SELECT content FROM memory_entry
		 WHERE agent_id = $1 AND memory_type IN ('semantic', 'identity', 'user_context', 'entity')
		   AND (superseded_by IS NULL)
		 ORDER BY importance_score DESC, created_at DESC LIMIT 20`, agentID)
	if serr == nil {
		defer srows.Close()
		for srows.Next() {
			var content string
			if srows.Scan(&content) == nil {
				parts = append(parts, "- "+content)
			}
		}
	}

	if len(parts) == 0 {
		return ""
	}

	// Deduplicate
	seen := make(map[string]bool)
	var unique []string
	for _, p := range parts {
		if !seen[p] {
			seen[p] = true
			unique = append(unique, p)
		}
	}

	// Cap at ~500 tokens (~2000 chars)
	result := strings.Join(unique, "\n")
	if len(result) > 2000 {
		result = result[:2000] + "\n..."
	}
	return result
}

// extractAndStoreMemories runs async after a chat exchange to extract salient facts.
func (h *Handler) extractAndStoreMemories(agentID, workspaceID uuid.UUID, sessionID string, userMessage, assistantResponse string) {
	go func() {
		ctx := context.Background()
		h.Logger.Info().Str("agent_id", agentID.String()).Str("workspace_id", workspaceID.String()).Msg("starting memory extraction")

		// Store episodic memory (raw exchange summary)
		episodic := "User said: " + truncate(userMessage, 200) + " | Assistant responded: " + truncate(assistantResponse, 300)
		_, epErr := h.DB.Exec(ctx,
			`INSERT INTO memory_entry (agent_id, workspace_id, content, memory_type, source_type, source_id)
			 VALUES ($1, $2, $3, 'episodic', 'chat', $4)`,
			agentID, workspaceID, episodic, sessionID)
		if epErr != nil {
			h.Logger.Error().Err(epErr).Msg("failed to store episodic memory")
		} else {
			h.Logger.Info().Msg("episodic memory stored")
		}

		// Extract semantic facts using Bifrost (cheap model)
		extractionPrompt := `Review this conversation exchange and extract any important facts worth remembering long-term:
- User preferences, decisions, or stated goals
- Important names, dates, numbers mentioned
- Action items or commitments
- Anything the user explicitly asked to remember

Return each fact as a separate line. Only include genuinely important information.
If there's nothing worth remembering, return "NONE".

User: ` + userMessage + `
Assistant: ` + assistantResponse

		resp, err := h.Router.Route(ctx, bifrost.CompletionRequest{
			Model: "claude-sonnet-4-6",
			Messages: []bifrost.Message{
				{Role: "user", Content: extractionPrompt},
			},
			MaxTokens:  512,
			Temperature: 0.0,
		})
		if err != nil {
			h.Logger.Error().Err(err).Str("agent_id", agentID.String()).Msg("memory extraction LLM call failed")
			// Still store the raw exchange as episodic even if semantic extraction fails
			return
		}
		h.Logger.Info().Str("extraction_result", resp.Content[:min(len(resp.Content), 100)]).Msg("memory extraction completed")

		content := strings.TrimSpace(resp.Content)
		if content == "" || content == "NONE" || strings.HasPrefix(content, "NONE") {
			return
		}

		// Store each extracted fact as a separate semantic memory
		facts := strings.Split(content, "\n")
		for _, fact := range facts {
			fact = strings.TrimSpace(fact)
			fact = strings.TrimPrefix(fact, "- ")
			fact = strings.TrimPrefix(fact, "• ")
			if fact == "" || fact == "NONE" || len(fact) < 5 {
				continue
			}
			_, err := h.DB.Exec(ctx,
				`INSERT INTO memory_entry (agent_id, workspace_id, content, memory_type, source_type, source_id, metadata)
				 VALUES ($1, $2, $3, 'semantic', 'extraction', $4, $5)`,
				agentID, workspaceID, fact, sessionID,
				`{"model":"claude-sonnet-4-6","source":"auto_extract"}`)
			if err != nil {
				h.Logger.Error().Err(err).Msg("failed to store extracted memory")
			}
		}

		h.Logger.Info().
			Str("agent_id", agentID.String()).
			Int("facts", len(facts)).
			Msg("memory extraction complete")
	}()
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max] + "..."
}
