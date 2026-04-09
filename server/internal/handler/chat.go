package handler

import (
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/bifrost"
)

type sessionRow struct {
	ID          uuid.UUID  `json:"id"`
	WorkspaceID uuid.UUID  `json:"workspace_id"`
	AgentID     uuid.UUID  `json:"agent_id"`
	CreatorID   uuid.UUID  `json:"creator_id"`
	Title       *string    `json:"title"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type messageRow struct {
	ID            uuid.UUID  `json:"id"`
	ChatSessionID uuid.UUID  `json:"chat_session_id"`
	WorkspaceID   uuid.UUID  `json:"workspace_id"`
	Role          string     `json:"role"`
	Content       string     `json:"content"`
	InputTokens   *int       `json:"input_tokens"`
	OutputTokens  *int       `json:"output_tokens"`
	Model         *string    `json:"model"`
	CreatedAt     time.Time  `json:"created_at"`
}

// GET /api/agents/{id}/sessions
func (h *Handler) handleListSessions(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, workspace_id, agent_id, creator_id, title, status, created_at, updated_at
		 FROM chat_session WHERE agent_id = $1 AND workspace_id = $2 ORDER BY created_at DESC`,
		agentID, wsID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list sessions")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	sessions := []sessionRow{}
	for rows.Next() {
		var s sessionRow
		if err := rows.Scan(&s.ID, &s.WorkspaceID, &s.AgentID, &s.CreatorID, &s.Title, &s.Status, &s.CreatedAt, &s.UpdatedAt); err != nil {
			h.Logger.Error().Err(err).Msg("failed to scan session")
			errJSON(w, http.StatusInternalServerError, "internal error")
			return
		}
		sessions = append(sessions, s)
	}

	writeJSON(w, http.StatusOK, sessions)
}

// POST /api/agents/{id}/sessions
func (h *Handler) handleCreateSession(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	var s sessionRow
	err = h.DB.QueryRow(r.Context(),
		`INSERT INTO chat_session (workspace_id, agent_id, creator_id)
		 VALUES ($1, $2, $3)
		 RETURNING id, workspace_id, agent_id, creator_id, title, status, created_at, updated_at`,
		wsID, agentID, userID).Scan(
		&s.ID, &s.WorkspaceID, &s.AgentID, &s.CreatorID, &s.Title, &s.Status, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to create session")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusCreated, s)
}

// GET /api/agents/{agentId}/sessions/{sessionId}/messages
func (h *Handler) handleListMessages(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	sessionID, err := uuid.Parse(chi.URLParam(r, "sessionId"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid session id")
		return
	}

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, chat_session_id, workspace_id, role, content, input_tokens, output_tokens, model, created_at
		 FROM chat_message WHERE chat_session_id = $1 AND workspace_id = $2 ORDER BY created_at ASC`,
		sessionID, wsID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list messages")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	messages := []messageRow{}
	for rows.Next() {
		var m messageRow
		if err := rows.Scan(&m.ID, &m.ChatSessionID, &m.WorkspaceID, &m.Role, &m.Content,
			&m.InputTokens, &m.OutputTokens, &m.Model, &m.CreatedAt); err != nil {
			h.Logger.Error().Err(err).Msg("failed to scan message")
			errJSON(w, http.StatusInternalServerError, "internal error")
			return
		}
		messages = append(messages, m)
	}

	writeJSON(w, http.StatusOK, messages)
}

// POST /api/agents/{agentId}/sessions/{sessionId}/messages
func (h *Handler) handleSendMessage(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	sessionID, err := uuid.Parse(chi.URLParam(r, "sessionId"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid session id")
		return
	}
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	var body struct {
		Content string `json:"content"`
	}
	if err := readJSON(r, &body); err != nil || strings.TrimSpace(body.Content) == "" {
		errJSON(w, http.StatusBadRequest, "content is required")
		return
	}

	ctx := r.Context()

	// Insert user message
	var userMsgID uuid.UUID
	err = h.DB.QueryRow(ctx,
		`INSERT INTO chat_message (chat_session_id, workspace_id, role, content)
		 VALUES ($1, $2, 'user', $3) RETURNING id`,
		sessionID, wsID, body.Content).Scan(&userMsgID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to insert user message")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	// Load agent instructions
	var agentInstructions *string
	var agentModel *string
	h.DB.QueryRow(ctx,
		`SELECT instructions, model FROM agent WHERE id = $1 AND workspace_id = $2`,
		agentID, wsID).Scan(&agentInstructions, &agentModel)

	// Load recent messages for context (last 50)
	msgRows, err := h.DB.Query(ctx,
		`SELECT role, content FROM chat_message
		 WHERE chat_session_id = $1 AND workspace_id = $2
		 ORDER BY created_at ASC LIMIT 50`,
		sessionID, wsID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to load message history")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer msgRows.Close()

	var messages []bifrost.Message
	if agentInstructions != nil && *agentInstructions != "" {
		messages = append(messages, bifrost.Message{Role: "system", Content: *agentInstructions})
	}
	for msgRows.Next() {
		var role, content string
		if err := msgRows.Scan(&role, &content); err != nil {
			continue
		}
		if role == "system" {
			continue
		}
		messages = append(messages, bifrost.Message{Role: role, Content: content})
	}

	// Determine model
	model := "claude-sonnet-4-6"
	if agentModel != nil && *agentModel != "" {
		model = *agentModel
	}

	// Stream via Bifrost
	ch := make(chan bifrost.StreamChunk, 64)
	req := bifrost.CompletionRequest{
		Model:     model,
		Messages:  messages,
		MaxTokens: 4096,
		Stream:    true,
	}

	// Generate assistant message ID upfront
	assistantMsgID := uuid.New()

	// Broadcast message_start
	h.Hub.BroadcastEvent(wsID.String(), "chat:message_start", map[string]interface{}{
		"session_id": sessionID.String(),
		"message_id": assistantMsgID.String(),
	})

	go func() {
		if err := h.Router.StreamRoute(ctx, req, ch); err != nil {
			h.Logger.Error().Err(err).Msg("stream route error")
			close(ch)
		}
	}()

	var fullContent strings.Builder
	var inputTokens, outputTokens int

	for chunk := range ch {
		fullContent.WriteString(chunk.Delta)

		// Broadcast each delta
		h.Hub.BroadcastEvent(wsID.String(), "chat:message_delta", map[string]interface{}{
			"session_id": sessionID.String(),
			"message_id": assistantMsgID.String(),
			"delta":      chunk.Delta,
		})
	}

	// Broadcast message_end
	h.Hub.BroadcastEvent(wsID.String(), "chat:message_end", map[string]interface{}{
		"session_id": sessionID.String(),
		"message_id": assistantMsgID.String(),
		"content":    fullContent.String(),
	})

	// Insert assistant message
	var savedMsg messageRow
	err = h.DB.QueryRow(ctx,
		`INSERT INTO chat_message (id, chat_session_id, workspace_id, role, content, input_tokens, output_tokens, model)
		 VALUES ($1, $2, $3, 'assistant', $4, $5, $6, $7)
		 RETURNING id, chat_session_id, workspace_id, role, content, input_tokens, output_tokens, model, created_at`,
		assistantMsgID, sessionID, wsID, fullContent.String(), inputTokens, outputTokens, model).Scan(
		&savedMsg.ID, &savedMsg.ChatSessionID, &savedMsg.WorkspaceID, &savedMsg.Role, &savedMsg.Content,
		&savedMsg.InputTokens, &savedMsg.OutputTokens, &savedMsg.Model, &savedMsg.CreatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to insert assistant message")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusOK, savedMsg)
}
