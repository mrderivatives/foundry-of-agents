package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
)

type skillRow struct {
	ID          uuid.UUID        `json:"id"`
	WorkspaceID *uuid.UUID       `json:"workspace_id"`
	Name        string           `json:"name"`
	Description *string          `json:"description"`
	Content     string           `json:"content"`
	SourceURL   *string          `json:"source_url,omitempty"`
	Version     *string          `json:"version,omitempty"`
	IsBuiltin   bool             `json:"is_builtin"`
	Category    *string          `json:"category,omitempty"`
	Config      json.RawMessage  `json:"config,omitempty"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}

type agentSkillRow struct {
	AgentID         uuid.UUID       `json:"agent_id"`
	SkillID         uuid.UUID       `json:"skill_id"`
	Enabled         bool            `json:"enabled"`
	Priority        int             `json:"priority"`
	ConfigOverrides json.RawMessage `json:"config_overrides,omitempty"`
	// Joined fields
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Category    *string `json:"category"`
	IsBuiltin   bool    `json:"is_builtin"`
}

// GET /api/skills — list skills in workspace (include built-ins)
func (h *Handler) handleListSkills(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, workspace_id, name, description, content, source_url, version, is_builtin, category, config, created_at, updated_at
		 FROM skill
		 WHERE workspace_id = $1 OR (is_builtin = true AND workspace_id IS NULL)
		 ORDER BY is_builtin DESC, name ASC`, wsID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list skills")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	skills := []skillRow{}
	for rows.Next() {
		var s skillRow
		if err := rows.Scan(&s.ID, &s.WorkspaceID, &s.Name, &s.Description, &s.Content,
			&s.SourceURL, &s.Version, &s.IsBuiltin, &s.Category, &s.Config,
			&s.CreatedAt, &s.UpdatedAt); err != nil {
			h.Logger.Error().Err(err).Msg("failed to scan skill")
			continue
		}
		skills = append(skills, s)
	}

	writeJSON(w, http.StatusOK, skills)
}

// POST /api/skills — create custom skill
func (h *Handler) handleCreateSkill(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())

	var body struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Content     string `json:"content"`
		Category    string `json:"category"`
	}
	if err := readJSON(r, &body); err != nil || body.Name == "" || body.Content == "" {
		errJSON(w, http.StatusBadRequest, "name and content are required")
		return
	}

	var s skillRow
	err := h.DB.QueryRow(r.Context(),
		`INSERT INTO skill (workspace_id, name, description, content, category, created_by)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, workspace_id, name, description, content, source_url, version, is_builtin, category, config, created_at, updated_at`,
		wsID, body.Name, nilIfEmpty(body.Description), body.Content, nilIfEmpty(body.Category), userID).Scan(
		&s.ID, &s.WorkspaceID, &s.Name, &s.Description, &s.Content,
		&s.SourceURL, &s.Version, &s.IsBuiltin, &s.Category, &s.Config,
		&s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to create skill")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusCreated, s)
}

// GET /api/skills/{skillId}
func (h *Handler) handleGetSkill(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	skillID, err := uuid.Parse(chi.URLParam(r, "skillId"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid skill id")
		return
	}

	var s skillRow
	err = h.DB.QueryRow(r.Context(),
		`SELECT id, workspace_id, name, description, content, source_url, version, is_builtin, category, config, created_at, updated_at
		 FROM skill
		 WHERE id = $1 AND (workspace_id = $2 OR (is_builtin = true AND workspace_id IS NULL))`,
		skillID, wsID).Scan(
		&s.ID, &s.WorkspaceID, &s.Name, &s.Description, &s.Content,
		&s.SourceURL, &s.Version, &s.IsBuiltin, &s.Category, &s.Config,
		&s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		errJSON(w, http.StatusNotFound, "skill not found")
		return
	}

	writeJSON(w, http.StatusOK, s)
}

// POST /api/agents/{id}/skills — assign skill to agent
func (h *Handler) handleAssignSkill(w http.ResponseWriter, r *http.Request) {
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	var body struct {
		SkillID  uuid.UUID `json:"skill_id"`
		Priority int       `json:"priority"`
	}
	if err := readJSON(r, &body); err != nil || body.SkillID == uuid.Nil {
		errJSON(w, http.StatusBadRequest, "skill_id is required")
		return
	}

	_, err = h.DB.Exec(r.Context(),
		`INSERT INTO agent_skill (agent_id, skill_id, enabled, priority)
		 VALUES ($1, $2, true, $3)
		 ON CONFLICT (agent_id, skill_id) DO UPDATE SET enabled = true, priority = EXCLUDED.priority`,
		agentID, body.SkillID, body.Priority)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to assign skill")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "assigned"})
}

// DELETE /api/agents/{id}/skills/{skillId} — unassign skill
func (h *Handler) handleUnassignSkill(w http.ResponseWriter, r *http.Request) {
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}
	skillID, err := uuid.Parse(chi.URLParam(r, "skillId"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid skill id")
		return
	}

	tag, err := h.DB.Exec(r.Context(),
		`DELETE FROM agent_skill WHERE agent_id = $1 AND skill_id = $2`, agentID, skillID)
	if err != nil || tag.RowsAffected() == 0 {
		errJSON(w, http.StatusNotFound, "skill assignment not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// GET /api/agents/{id}/skills — list skills assigned to agent
func (h *Handler) handleListAgentSkills(w http.ResponseWriter, r *http.Request) {
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	rows, err := h.DB.Query(r.Context(),
		`SELECT as2.agent_id, as2.skill_id, as2.enabled, as2.priority, as2.config_overrides,
		        s.name, s.description, s.category, s.is_builtin
		 FROM agent_skill as2
		 JOIN skill s ON s.id = as2.skill_id
		 WHERE as2.agent_id = $1
		 ORDER BY as2.priority DESC`, agentID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list agent skills")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	skills := []agentSkillRow{}
	for rows.Next() {
		var s agentSkillRow
		if err := rows.Scan(&s.AgentID, &s.SkillID, &s.Enabled, &s.Priority, &s.ConfigOverrides,
			&s.Name, &s.Description, &s.Category, &s.IsBuiltin); err != nil {
			h.Logger.Error().Err(err).Msg("failed to scan agent skill")
			continue
		}
		skills = append(skills, s)
	}

	writeJSON(w, http.StatusOK, skills)
}
