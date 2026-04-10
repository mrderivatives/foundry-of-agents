package handler

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
)

type cronJobRow struct {
	ID                  uuid.UUID        `json:"id"`
	WorkspaceID         uuid.UUID        `json:"workspace_id"`
	AgentID             uuid.UUID        `json:"agent_id"`
	OwnerID             uuid.UUID        `json:"owner_id"`
	Name                *string          `json:"name"`
	Description         *string          `json:"description"`
	CronExpression      string           `json:"cron_expression"`
	Timezone            string           `json:"timezone"`
	Prompt              string           `json:"prompt"`
	OutputChannel       *string          `json:"output_channel,omitempty"`
	OutputTarget        *string          `json:"output_target,omitempty"`
	Enabled             bool             `json:"enabled"`
	LastRunAt           *time.Time       `json:"last_run_at,omitempty"`
	NextRunAt           *time.Time       `json:"next_run_at,omitempty"`
	LastRunStatus       *string          `json:"last_run_status,omitempty"`
	ConsecutiveFailures int              `json:"consecutive_failures"`
	MaxCostPerRun       *decimal.Decimal `json:"max_cost_per_run,omitempty"`
	TimeoutSeconds      int              `json:"timeout_seconds"`
	CreatedAt           time.Time        `json:"created_at"`
	UpdatedAt           time.Time        `json:"updated_at"`
}

// POST /api/agents/{id}/cron-jobs
func (h *Handler) handleCreateCronJob(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	var body struct {
		Name           string           `json:"name"`
		Description    string           `json:"description"`
		CronExpression string           `json:"cron_expression"`
		Timezone       string           `json:"timezone"`
		Prompt         string           `json:"prompt"`
		OutputChannel  string           `json:"output_channel"`
		OutputTarget   string           `json:"output_target"`
		Enabled        *bool            `json:"enabled"`
		MaxCostPerRun  *decimal.Decimal `json:"max_cost_per_run"`
		TimeoutSeconds *int             `json:"timeout_seconds"`
	}
	if err := readJSON(r, &body); err != nil || body.CronExpression == "" || body.Prompt == "" {
		errJSON(w, http.StatusBadRequest, "cron_expression and prompt are required")
		return
	}
	if body.Timezone == "" {
		body.Timezone = "UTC"
	}
	enabled := true
	if body.Enabled != nil {
		enabled = *body.Enabled
	}
	timeoutSec := 300
	if body.TimeoutSeconds != nil {
		timeoutSec = *body.TimeoutSeconds
	}

	var cj cronJobRow
	err = h.DB.QueryRow(r.Context(),
		`INSERT INTO cron_job (workspace_id, agent_id, owner_id, name, description, cron_expression, timezone, prompt, output_channel, output_target, enabled, max_cost_per_run, timeout_seconds)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		 RETURNING id, workspace_id, agent_id, owner_id, name, description, cron_expression, timezone, prompt, output_channel, output_target, enabled, last_run_at, next_run_at, last_run_status, consecutive_failures, max_cost_per_run, timeout_seconds, created_at, updated_at`,
		wsID, agentID, userID, nilIfEmpty(body.Name), nilIfEmpty(body.Description),
		body.CronExpression, body.Timezone, body.Prompt,
		nilIfEmpty(body.OutputChannel), nilIfEmpty(body.OutputTarget),
		enabled, body.MaxCostPerRun, timeoutSec).Scan(
		&cj.ID, &cj.WorkspaceID, &cj.AgentID, &cj.OwnerID, &cj.Name, &cj.Description,
		&cj.CronExpression, &cj.Timezone, &cj.Prompt, &cj.OutputChannel, &cj.OutputTarget,
		&cj.Enabled, &cj.LastRunAt, &cj.NextRunAt, &cj.LastRunStatus,
		&cj.ConsecutiveFailures, &cj.MaxCostPerRun, &cj.TimeoutSeconds,
		&cj.CreatedAt, &cj.UpdatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to create cron job")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusCreated, cj)
}

// GET /api/agents/{id}/cron-jobs
func (h *Handler) handleListCronJobs(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, workspace_id, agent_id, owner_id, name, description, cron_expression, timezone, prompt, output_channel, output_target, enabled, last_run_at, next_run_at, last_run_status, consecutive_failures, max_cost_per_run, timeout_seconds, created_at, updated_at
		 FROM cron_job WHERE agent_id = $1 AND workspace_id = $2
		 ORDER BY created_at DESC`, agentID, wsID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list cron jobs")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	jobs := []cronJobRow{}
	for rows.Next() {
		var cj cronJobRow
		if err := rows.Scan(&cj.ID, &cj.WorkspaceID, &cj.AgentID, &cj.OwnerID, &cj.Name, &cj.Description,
			&cj.CronExpression, &cj.Timezone, &cj.Prompt, &cj.OutputChannel, &cj.OutputTarget,
			&cj.Enabled, &cj.LastRunAt, &cj.NextRunAt, &cj.LastRunStatus,
			&cj.ConsecutiveFailures, &cj.MaxCostPerRun, &cj.TimeoutSeconds,
			&cj.CreatedAt, &cj.UpdatedAt); err != nil {
			h.Logger.Error().Err(err).Msg("failed to scan cron job")
			continue
		}
		jobs = append(jobs, cj)
	}

	writeJSON(w, http.StatusOK, jobs)
}

// PATCH /api/cron-jobs/{cronId}
func (h *Handler) handleUpdateCronJob(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	cronID, err := uuid.Parse(chi.URLParam(r, "cronId"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid cron job id")
		return
	}

	var body struct {
		Name           *string          `json:"name"`
		Description    *string          `json:"description"`
		CronExpression *string          `json:"cron_expression"`
		Timezone       *string          `json:"timezone"`
		Prompt         *string          `json:"prompt"`
		OutputChannel  *string          `json:"output_channel"`
		OutputTarget   *string          `json:"output_target"`
		Enabled        *bool            `json:"enabled"`
		MaxCostPerRun  *decimal.Decimal `json:"max_cost_per_run"`
		TimeoutSeconds *int             `json:"timeout_seconds"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var cj cronJobRow
	err = h.DB.QueryRow(r.Context(),
		`UPDATE cron_job SET
			name = COALESCE($3, name),
			description = COALESCE($4, description),
			cron_expression = COALESCE($5, cron_expression),
			timezone = COALESCE($6, timezone),
			prompt = COALESCE($7, prompt),
			output_channel = COALESCE($8, output_channel),
			output_target = COALESCE($9, output_target),
			enabled = COALESCE($10, enabled),
			max_cost_per_run = COALESCE($11, max_cost_per_run),
			timeout_seconds = COALESCE($12, timeout_seconds),
			updated_at = NOW()
		 WHERE id = $1 AND workspace_id = $2
		 RETURNING id, workspace_id, agent_id, owner_id, name, description, cron_expression, timezone, prompt, output_channel, output_target, enabled, last_run_at, next_run_at, last_run_status, consecutive_failures, max_cost_per_run, timeout_seconds, created_at, updated_at`,
		cronID, wsID, body.Name, body.Description, body.CronExpression, body.Timezone,
		body.Prompt, body.OutputChannel, body.OutputTarget, body.Enabled,
		body.MaxCostPerRun, body.TimeoutSeconds).Scan(
		&cj.ID, &cj.WorkspaceID, &cj.AgentID, &cj.OwnerID, &cj.Name, &cj.Description,
		&cj.CronExpression, &cj.Timezone, &cj.Prompt, &cj.OutputChannel, &cj.OutputTarget,
		&cj.Enabled, &cj.LastRunAt, &cj.NextRunAt, &cj.LastRunStatus,
		&cj.ConsecutiveFailures, &cj.MaxCostPerRun, &cj.TimeoutSeconds,
		&cj.CreatedAt, &cj.UpdatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to update cron job")
		errJSON(w, http.StatusNotFound, "cron job not found")
		return
	}

	writeJSON(w, http.StatusOK, cj)
}

// DELETE /api/cron-jobs/{cronId}
func (h *Handler) handleDeleteCronJob(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	cronID, err := uuid.Parse(chi.URLParam(r, "cronId"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid cron job id")
		return
	}

	tag, err := h.DB.Exec(r.Context(),
		`DELETE FROM cron_job WHERE id = $1 AND workspace_id = $2`, cronID, wsID)
	if err != nil || tag.RowsAffected() == 0 {
		errJSON(w, http.StatusNotFound, "cron job not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
