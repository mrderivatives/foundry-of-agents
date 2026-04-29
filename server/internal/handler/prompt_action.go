package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

type PromptActionVariable struct {
	Name        string   `json:"name"`
	Type        string   `json:"type"`
	Label       string   `json:"label"`
	Suggestions []string `json:"suggestions,omitempty"`
	Placeholder string   `json:"placeholder,omitempty"`
}

type PromptActionResponse struct {
	ID               string                 `json:"id"`
	Slug             string                 `json:"slug"`
	Name             string                 `json:"name"`
	Description      string                 `json:"description"`
	Icon             string                 `json:"icon"`
	Category         string                 `json:"category"`
	TeamTemplates    []string               `json:"team_templates"`
	PromptTemplate   string                 `json:"prompt_template"`
	Variables        []PromptActionVariable `json:"variables"`
	ExpectedOutput   string                 `json:"expected_output"`
	EstimatedSeconds int                    `json:"estimated_seconds"`
	UsageCount       int                    `json:"usage_count"`
	SortOrder        int                    `json:"sort_order"`
}

// GET /api/prompt-actions?teamTemplate=crypto
func (h *Handler) handleListPromptActions(w http.ResponseWriter, r *http.Request) {
	teamTemplate := r.URL.Query().Get("teamTemplate")

	var rows pgx.Rows
	var err error

	if teamTemplate != "" {
		rows, err = h.DB.Query(r.Context(),
			`SELECT id, slug, name, COALESCE(description,''), COALESCE(icon,''), category,
			        team_templates, prompt_template, COALESCE(variables,'[]'),
			        COALESCE(expected_output,'inline'), COALESCE(estimated_seconds,60),
			        usage_count, sort_order
			 FROM prompt_action
			 WHERE enabled = TRUE AND $1 = ANY(team_templates)
			 ORDER BY category ASC, sort_order ASC`,
			teamTemplate)
	} else {
		rows, err = h.DB.Query(r.Context(),
			`SELECT id, slug, name, COALESCE(description,''), COALESCE(icon,''), category,
			        team_templates, prompt_template, COALESCE(variables,'[]'),
			        COALESCE(expected_output,'inline'), COALESCE(estimated_seconds,60),
			        usage_count, sort_order
			 FROM prompt_action
			 WHERE enabled = TRUE
			 ORDER BY category ASC, sort_order ASC`)
	}
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list prompt actions")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	actions := []PromptActionResponse{}
	for rows.Next() {
		var a PromptActionResponse
		var variablesJSON []byte
		err := rows.Scan(&a.ID, &a.Slug, &a.Name, &a.Description, &a.Icon, &a.Category,
			&a.TeamTemplates, &a.PromptTemplate, &variablesJSON,
			&a.ExpectedOutput, &a.EstimatedSeconds, &a.UsageCount, &a.SortOrder)
		if err != nil {
			h.Logger.Error().Err(err).Msg("scan prompt action")
			continue
		}
		if err := json.Unmarshal(variablesJSON, &a.Variables); err != nil {
			a.Variables = []PromptActionVariable{}
		}
		actions = append(actions, a)
	}

	writeJSON(w, http.StatusOK, actions)
}

// POST /api/prompt-actions/{slug}/execute — track execution + increment usage count
func (h *Handler) handleExecutePromptAction(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	var body struct {
		WorkspaceID string          `json:"workspace_id"`
		AgentID     string          `json:"agent_id"`
		Variables   json.RawMessage `json:"variables"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "bad request")
		return
	}

	// Increment usage count
	_, err := h.DB.Exec(r.Context(),
		`UPDATE prompt_action SET usage_count = usage_count + 1 WHERE slug = $1`, slug)
	if err != nil {
		h.Logger.Error().Err(err).Str("slug", slug).Msg("failed to increment usage count")
	}

	// Record execution
	var execID string
	err = h.DB.QueryRow(r.Context(),
		`INSERT INTO prompt_action_execution (action_id, workspace_id, agent_id, variables, started_at)
		 SELECT id, $2::uuid, $3::uuid, $4, NOW() FROM prompt_action WHERE slug = $1
		 RETURNING id`,
		slug, body.WorkspaceID, body.AgentID, body.Variables).Scan(&execID)
	if err != nil {
		h.Logger.Error().Err(err).Str("slug", slug).Msg("failed to record execution")
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"execution_id": execID,
		"started_at":   time.Now().UTC(),
	})
}

// POST /api/prompt-actions/executions/{id}/complete — mark execution done
func (h *Handler) handleCompletePromptExecution(w http.ResponseWriter, r *http.Request) {
	execID := chi.URLParam(r, "id")
	var body struct {
		Success bool   `json:"success"`
		Output  string `json:"output_type"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "bad request")
		return
	}

	_, err := h.DB.Exec(r.Context(),
		`UPDATE prompt_action_execution
		 SET completed_at = NOW(),
		     duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INT,
		     output_type = $2,
		     success = $3
		 WHERE id = $1::uuid`,
		execID, body.Output, body.Success)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to complete execution")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
