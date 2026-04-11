package handler

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
)

type teamRow struct {
	ID          uuid.UUID  `json:"id"`
	WorkspaceID uuid.UUID  `json:"workspace_id"`
	TemplateID  string     `json:"template_id"`
	Name        string     `json:"name"`
	LeadAgentID *uuid.UUID `json:"lead_agent_id"`
	AccentColor *string    `json:"accent_color"`
	CreatedAt   time.Time  `json:"created_at"`
}

type teamMemberOut struct {
	AgentID        uuid.UUID `json:"agent_id"`
	AgentName      string    `json:"agent_name"`
	Role           string    `json:"role"`
	SpecialistRole *string   `json:"specialist_role"`
	Position       int       `json:"position"`
}

type teamDetailOut struct {
	teamRow
	Members []teamMemberOut `json:"members"`
}

// POST /api/teams
func (h *Handler) handleCreateTeam(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())

	var body struct {
		TemplateID      string   `json:"template_id"`
		LeadName        string   `json:"lead_name"`
		SpecialistNames []string `json:"specialist_names"`
		AccentColor     *string  `json:"accent_color"`
	}
	if err := readJSON(r, &body); err != nil || body.TemplateID == "" || body.LeadName == "" {
		errJSON(w, http.StatusBadRequest, "template_id and lead_name are required")
		return
	}

	ctx := r.Context()
	tx, err := h.DB.Begin(ctx)
	if err != nil {
		h.Logger.Error().Err(err).Msg("begin tx")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer tx.Rollback(ctx)

	// Build lead system prompt
	var specLines []string
	for i, name := range body.SpecialistNames {
		specLines = append(specLines, fmt.Sprintf("- %s (Specialist %d)", name, i+1))
	}
	leadInstructions := fmt.Sprintf(`You are %s, the Lead of an AI team.

Your team members:
%s

When users ask for help, acknowledge which team member would handle it. Use their names. Example:
"Let me have %s look into that for you."
Then provide the answer yourself (you have all their capabilities).

Always reference your team. Make the user feel like they have a full team working for them.`,
		body.LeadName,
		strings.Join(specLines, "\n"),
		func() string {
			if len(body.SpecialistNames) > 0 {
				return body.SpecialistNames[0]
			}
			return "a specialist"
		}(),
	)

	// Create lead agent
	var leadAgent agentRow
	err = tx.QueryRow(ctx,
		`INSERT INTO agent (workspace_id, name, description, instructions, model, owner_id, status)
		 VALUES ($1, $2, $3, $4, 'claude-sonnet-4-6', $5, 'idle')
		 RETURNING id, workspace_id, name, description, instructions, avatar_url, model, status, visibility, owner_id, archived_at, created_at, updated_at`,
		wsID, body.LeadName, "Team Lead agent", leadInstructions, userID).Scan(
		&leadAgent.ID, &leadAgent.WorkspaceID, &leadAgent.Name, &leadAgent.Description, &leadAgent.Instructions,
		&leadAgent.AvatarURL, &leadAgent.Model, &leadAgent.Status, &leadAgent.Visibility, &leadAgent.OwnerID, &leadAgent.ArchivedAt, &leadAgent.CreatedAt, &leadAgent.UpdatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("create lead agent")
		errJSON(w, http.StatusInternalServerError, "failed to create lead agent")
		return
	}

	// Determine team name
	teamName := body.LeadName + "'s Team"

	// Create team
	var t teamRow
	err = tx.QueryRow(ctx,
		`INSERT INTO team (workspace_id, template_id, name, lead_agent_id, accent_color)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, workspace_id, template_id, name, lead_agent_id, accent_color, created_at`,
		wsID, body.TemplateID, teamName, leadAgent.ID, body.AccentColor).Scan(
		&t.ID, &t.WorkspaceID, &t.TemplateID, &t.Name, &t.LeadAgentID, &t.AccentColor, &t.CreatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("create team")
		errJSON(w, http.StatusInternalServerError, "failed to create team")
		return
	}

	// Add lead as team member
	_, err = tx.Exec(ctx,
		`INSERT INTO team_member (team_id, agent_id, role, position) VALUES ($1, $2, 'lead', 0)`,
		t.ID, leadAgent.ID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("add lead member")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	members := []teamMemberOut{{
		AgentID:   leadAgent.ID,
		AgentName: leadAgent.Name,
		Role:      "lead",
		Position:  0,
	}}

	// Create specialist agents
	for i, specName := range body.SpecialistNames {
		specInstructions := fmt.Sprintf(`You are %s, a specialist on %s's team.
You focus on your area of expertise. Provide thorough, detailed analysis when asked.
Your lead is %s — they coordinate the team.`, specName, body.LeadName, body.LeadName)

		var specAgent agentRow
		err = tx.QueryRow(ctx,
			`INSERT INTO agent (workspace_id, name, description, instructions, model, owner_id, status)
			 VALUES ($1, $2, $3, $4, 'claude-sonnet-4-6', $5, 'idle')
			 RETURNING id, workspace_id, name, description, instructions, avatar_url, model, status, visibility, owner_id, archived_at, created_at, updated_at`,
			wsID, specName, "Specialist agent", specInstructions, userID).Scan(
			&specAgent.ID, &specAgent.WorkspaceID, &specAgent.Name, &specAgent.Description, &specAgent.Instructions,
			&specAgent.AvatarURL, &specAgent.Model, &specAgent.Status, &specAgent.Visibility, &specAgent.OwnerID, &specAgent.ArchivedAt, &specAgent.CreatedAt, &specAgent.UpdatedAt)
		if err != nil {
			h.Logger.Error().Err(err).Msg("create specialist agent")
			errJSON(w, http.StatusInternalServerError, "failed to create specialist agent")
			return
		}

		specRole := fmt.Sprintf("Specialist %d", i+1)
		_, err = tx.Exec(ctx,
			`INSERT INTO team_member (team_id, agent_id, role, specialist_role, position)
			 VALUES ($1, $2, 'specialist', $3, $4)`,
			t.ID, specAgent.ID, specRole, i+1)
		if err != nil {
			h.Logger.Error().Err(err).Msg("add specialist member")
			errJSON(w, http.StatusInternalServerError, "internal error")
			return
		}

		members = append(members, teamMemberOut{
			AgentID:        specAgent.ID,
			AgentName:      specAgent.Name,
			Role:           "specialist",
			SpecialistRole: &specRole,
			Position:       i + 1,
		})
	}

	if err := tx.Commit(ctx); err != nil {
		h.Logger.Error().Err(err).Msg("commit tx")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusCreated, teamDetailOut{
		teamRow: t,
		Members: members,
	})
}

// GET /api/teams
func (h *Handler) handleListTeams(w http.ResponseWriter, r *http.Request) {
	wsID, ok := auth.GetWorkspaceID(r.Context())
	if !ok {
		errJSON(w, http.StatusUnauthorized, "missing workspace")
		return
	}

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, workspace_id, template_id, name, lead_agent_id, accent_color, created_at
		 FROM team WHERE workspace_id = $1 ORDER BY created_at DESC`, wsID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("list teams")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	teams := []teamRow{}
	for rows.Next() {
		var t teamRow
		if err := rows.Scan(&t.ID, &t.WorkspaceID, &t.TemplateID, &t.Name, &t.LeadAgentID, &t.AccentColor, &t.CreatedAt); err != nil {
			h.Logger.Error().Err(err).Msg("scan team")
			errJSON(w, http.StatusInternalServerError, "internal error")
			return
		}
		teams = append(teams, t)
	}

	writeJSON(w, http.StatusOK, teams)
}

// GET /api/teams/{teamId}
func (h *Handler) handleGetTeam(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	teamID, err := uuid.Parse(chi.URLParam(r, "teamId"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid team id")
		return
	}

	var t teamRow
	err = h.DB.QueryRow(r.Context(),
		`SELECT id, workspace_id, template_id, name, lead_agent_id, accent_color, created_at
		 FROM team WHERE id = $1 AND workspace_id = $2`, teamID, wsID).Scan(
		&t.ID, &t.WorkspaceID, &t.TemplateID, &t.Name, &t.LeadAgentID, &t.AccentColor, &t.CreatedAt)
	if err != nil {
		errJSON(w, http.StatusNotFound, "team not found")
		return
	}

	// Get members
	mRows, err := h.DB.Query(r.Context(),
		`SELECT tm.agent_id, a.name, tm.role, tm.specialist_role, tm.position
		 FROM team_member tm
		 JOIN agent a ON a.id = tm.agent_id
		 WHERE tm.team_id = $1
		 ORDER BY tm.position`, teamID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("get team members")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer mRows.Close()

	members := []teamMemberOut{}
	for mRows.Next() {
		var m teamMemberOut
		if err := mRows.Scan(&m.AgentID, &m.AgentName, &m.Role, &m.SpecialistRole, &m.Position); err != nil {
			h.Logger.Error().Err(err).Msg("scan member")
			errJSON(w, http.StatusInternalServerError, "internal error")
			return
		}
		members = append(members, m)
	}

	writeJSON(w, http.StatusOK, teamDetailOut{
		teamRow: t,
		Members: members,
	})
}
