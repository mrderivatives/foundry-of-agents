package handler

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
)

type agentRow struct {
	ID          uuid.UUID  `json:"id"`
	WorkspaceID uuid.UUID  `json:"workspace_id"`
	Name        string     `json:"name"`
	Description *string    `json:"description"`
	Instructions *string   `json:"instructions"`
	AvatarURL   *string    `json:"avatar_url"`
	Model       *string    `json:"model"`
	Status      string     `json:"status"`
	Visibility  string     `json:"visibility"`
	OwnerID     uuid.UUID  `json:"owner_id"`
	ArchivedAt  *time.Time `json:"archived_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// GET /api/agents
func (h *Handler) handleListAgents(w http.ResponseWriter, r *http.Request) {
	wsID, ok := auth.GetWorkspaceID(r.Context())
	if !ok {
		errJSON(w, http.StatusUnauthorized, "missing workspace")
		return
	}

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, workspace_id, name, description, instructions, avatar_url, model, status, visibility, owner_id, archived_at, created_at, updated_at
		 FROM agent WHERE workspace_id = $1 AND archived_at IS NULL ORDER BY created_at DESC`, wsID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list agents")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	agents := []agentRow{}
	for rows.Next() {
		var a agentRow
		if err := rows.Scan(&a.ID, &a.WorkspaceID, &a.Name, &a.Description, &a.Instructions,
			&a.AvatarURL, &a.Model, &a.Status, &a.Visibility, &a.OwnerID, &a.ArchivedAt, &a.CreatedAt, &a.UpdatedAt); err != nil {
			h.Logger.Error().Err(err).Msg("failed to scan agent")
			errJSON(w, http.StatusInternalServerError, "internal error")
			return
		}
		agents = append(agents, a)
	}

	writeJSON(w, http.StatusOK, agents)
}

// POST /api/agents
func (h *Handler) handleCreateAgent(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())

	var body struct {
		Name         string  `json:"name"`
		Description  *string `json:"description"`
		Instructions *string `json:"instructions"`
		AvatarURL    *string `json:"avatar_url"`
		Model        *string `json:"model"`
	}
	if err := readJSON(r, &body); err != nil || body.Name == "" {
		errJSON(w, http.StatusBadRequest, "name is required")
		return
	}

	var a agentRow
	err := h.DB.QueryRow(r.Context(),
		`INSERT INTO agent (workspace_id, name, description, instructions, avatar_url, model, owner_id, status)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, 'idle')
		 RETURNING id, workspace_id, name, description, instructions, avatar_url, model, status, visibility, owner_id, archived_at, created_at, updated_at`,
		wsID, body.Name, body.Description, body.Instructions, body.AvatarURL, body.Model, userID).Scan(
		&a.ID, &a.WorkspaceID, &a.Name, &a.Description, &a.Instructions,
		&a.AvatarURL, &a.Model, &a.Status, &a.Visibility, &a.OwnerID, &a.ArchivedAt, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to create agent")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusCreated, a)
}

// GET /api/agents/{id}
func (h *Handler) handleGetAgent(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	var a agentRow
	err = h.DB.QueryRow(r.Context(),
		`SELECT id, workspace_id, name, description, instructions, avatar_url, model, status, visibility, owner_id, archived_at, created_at, updated_at
		 FROM agent WHERE id = $1 AND workspace_id = $2`, agentID, wsID).Scan(
		&a.ID, &a.WorkspaceID, &a.Name, &a.Description, &a.Instructions,
		&a.AvatarURL, &a.Model, &a.Status, &a.Visibility, &a.OwnerID, &a.ArchivedAt, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		errJSON(w, http.StatusNotFound, "agent not found")
		return
	}

	writeJSON(w, http.StatusOK, a)
}

// PATCH /api/agents/{id}
func (h *Handler) handleUpdateAgent(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	var body struct {
		Name         *string `json:"name"`
		Description  *string `json:"description"`
		Instructions *string `json:"instructions"`
		AvatarURL    *string `json:"avatar_url"`
		Model        *string `json:"model"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var a agentRow
	err = h.DB.QueryRow(r.Context(),
		`UPDATE agent SET
			name = COALESCE($3, name),
			description = COALESCE($4, description),
			instructions = COALESCE($5, instructions),
			avatar_url = COALESCE($6, avatar_url),
			model = COALESCE($7, model),
			updated_at = NOW()
		 WHERE id = $1 AND workspace_id = $2
		 RETURNING id, workspace_id, name, description, instructions, avatar_url, model, status, visibility, owner_id, archived_at, created_at, updated_at`,
		agentID, wsID, body.Name, body.Description, body.Instructions, body.AvatarURL, body.Model).Scan(
		&a.ID, &a.WorkspaceID, &a.Name, &a.Description, &a.Instructions,
		&a.AvatarURL, &a.Model, &a.Status, &a.Visibility, &a.OwnerID, &a.ArchivedAt, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		errJSON(w, http.StatusNotFound, "agent not found")
		return
	}

	writeJSON(w, http.StatusOK, a)
}

// DELETE /api/agents/{id}
func (h *Handler) handleDeleteAgent(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	tag, err := h.DB.Exec(r.Context(),
		`UPDATE agent SET archived_at = NOW() WHERE id = $1 AND workspace_id = $2 AND archived_at IS NULL`,
		agentID, wsID)
	if err != nil || tag.RowsAffected() == 0 {
		errJSON(w, http.StatusNotFound, "agent not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
