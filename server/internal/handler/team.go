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

// characterImages maps character IDs to their avatar image paths.
var characterImages = map[string]string{
	"coach":             "/characters/char-coach.png",
	"fantasy-manager":   "/characters/char-planner.png",
	"gambling-guru":     "/characters/char-gambling-guru.png",
	"sports-journalist": "/characters/char-analyst.png",
	"managing-director": "/characters/char-commander.png",
	"analyst":           "/characters/char-analyst.png",
	"quant":             "/characters/char-quant.png",
	"trader":            "/characters/char-trader.png",
	"chief-of-staff":    "/characters/char-commander.png",
	"planner":           "/characters/char-planner.png",
	"career-analyst":    "/characters/char-analyst.png",
	"networking-growth": "/characters/char-growth-hacker.png",
	"product-chief":     "/characters/char-commander.png",
	"cto":               "/characters/char-cto.png",
	"growth-hacker":     "/characters/char-growth-hacker.png",
	"cfo":               "/characters/char-cfo.png",
	"default-lead":      "/characters/char-commander.png",
}

// POST /api/teams
func (h *Handler) handleCreateTeam(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())

	var body struct {
		TemplateID  string  `json:"template_id"`
		LeadName    string  `json:"lead_name"`
		LeadRole    string  `json:"lead_role"`
		LeadCharID  string  `json:"lead_character_id"`
		AccentColor *string `json:"accent_color"`
		Specialists []struct {
			Name        string `json:"name"`
			Role        string `json:"role"`
			CharacterID string `json:"character_id"`
			Description string `json:"description"`
		} `json:"specialists"`
		// Legacy field: ignored if Specialists is provided
		SpecialistNames []string `json:"specialist_names"`
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

	// Resolve lead avatar
	leadCharID := body.LeadCharID
	if leadCharID == "" {
		leadCharID = "default-lead"
	}
	leadAvatar := characterImages[leadCharID]
	if leadAvatar == "" {
		leadAvatar = characterImages["default-lead"]
	}

	// Resolve lead role
	leadRole := body.LeadRole
	if leadRole == "" {
		leadRole = "Lead"
	}

	// Build specialist description lines for lead prompt
	var specDescriptions []string
	var specNames []string
	if len(body.Specialists) > 0 {
		for _, spec := range body.Specialists {
			specDescriptions = append(specDescriptions, fmt.Sprintf("- %s (%s): %s", spec.Name, spec.Role, spec.Description))
			specNames = append(specNames, spec.Name)
		}
	} else {
		// Legacy path: specialist_names only
		for i, name := range body.SpecialistNames {
			specDescriptions = append(specDescriptions, fmt.Sprintf("- %s (Specialist %d)", name, i+1))
			specNames = append(specNames, name)
		}
	}

	// Pick two names for the lead prompt examples
	firstName := "a specialist"
	secondName := "another specialist"
	if len(specNames) > 0 {
		firstName = specNames[0]
	}
	if len(specNames) > 1 {
		secondName = specNames[1]
	}

	leadInstructions := fmt.Sprintf(`You are %s, the %s of your AI team.

YOUR TEAM:
%s

BEHAVIOR:
- When the user asks for help, acknowledge which team member would handle it
- Say things like "Let me have %s look into this..." or "I'll get %s on that"
- Then answer the question yourself — you have all their capabilities
- Always make the user feel like they have a full team working for them
- Reference your team members by name naturally in conversation`,
		body.LeadName, leadRole, strings.Join(specDescriptions, "\n"), firstName, secondName)

	// Create lead agent with avatar_url
	var leadAgent agentRow
	err = tx.QueryRow(ctx,
		`INSERT INTO agent (workspace_id, name, description, instructions, avatar_url, model, owner_id, status)
		 VALUES ($1, $2, $3, $4, $5, 'claude-sonnet-4-6', $6, 'idle')
		 RETURNING id, workspace_id, name, description, instructions, avatar_url, model, status, visibility, owner_id, archived_at, created_at, updated_at`,
		wsID, body.LeadName, fmt.Sprintf("Team %s", leadRole), leadInstructions, leadAvatar, userID).Scan(
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
	if len(body.Specialists) > 0 {
		// New path: full specialist data
		for i, spec := range body.Specialists {
			specAvatar := characterImages[spec.CharacterID]
			if specAvatar == "" {
				specAvatar = characterImages["default-lead"]
			}

			specPrompt := fmt.Sprintf("You are %s, a %s specialist. %s", spec.Name, spec.Role, spec.Description)

			var specAgent agentRow
			err = tx.QueryRow(ctx,
				`INSERT INTO agent (workspace_id, parent_agent_id, name, description, instructions, avatar_url, model, owner_id, status)
				 VALUES ($1, $2, $3, $4, $5, $6, 'claude-sonnet-4-6', $7, 'idle')
				 RETURNING id, workspace_id, name, description, instructions, avatar_url, model, status, visibility, owner_id, archived_at, created_at, updated_at`,
				wsID, leadAgent.ID, spec.Name, fmt.Sprintf("%s specialist", spec.Role), specPrompt, specAvatar, userID).Scan(
				&specAgent.ID, &specAgent.WorkspaceID, &specAgent.Name, &specAgent.Description, &specAgent.Instructions,
				&specAgent.AvatarURL, &specAgent.Model, &specAgent.Status, &specAgent.Visibility, &specAgent.OwnerID, &specAgent.ArchivedAt, &specAgent.CreatedAt, &specAgent.UpdatedAt)
			if err != nil {
				h.Logger.Error().Err(err).Msg("create specialist agent")
				errJSON(w, http.StatusInternalServerError, "failed to create specialist agent")
				return
			}

			specRole := spec.Role
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
	} else {
		// Legacy path: specialist_names only
		for i, specName := range body.SpecialistNames {
			specInstructions := fmt.Sprintf(`You are %s, a specialist on %s's team.
You focus on your area of expertise. Provide thorough, detailed analysis when asked.
Your lead is %s — they coordinate the team.`, specName, body.LeadName, body.LeadName)

			var specAgent agentRow
			err = tx.QueryRow(ctx,
				`INSERT INTO agent (workspace_id, parent_agent_id, name, description, instructions, model, owner_id, status)
				 VALUES ($1, $2, $3, $4, $5, 'claude-sonnet-4-6', $6, 'idle')
				 RETURNING id, workspace_id, name, description, instructions, avatar_url, model, status, visibility, owner_id, archived_at, created_at, updated_at`,
				wsID, leadAgent.ID, specName, "Specialist agent", specInstructions, userID).Scan(
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
