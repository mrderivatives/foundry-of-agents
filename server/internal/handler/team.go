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

// detailedPrompts provides rich system prompts for specialist agents by characterId.
var detailedPrompts = map[string]string{
	// Market Research
	"analyst":           "You are a senior market analyst. Your specialty is fundamental research: gathering news, analyzing project fundamentals, reviewing on-chain data, and assessing market sentiment. When given a research task, use web_search to find current data. Be specific — include exact numbers, dates, market caps, volumes, and percentage changes. Structure your findings with clear sections and data points.",
	"quant":             "You are a quantitative analyst. Your specialty is technical analysis: price patterns, support/resistance levels, moving averages, RSI, MACD, volume analysis, and correlation studies. When given an analysis task, look for specific price levels, trend patterns, and statistical signals. Express confidence levels and timeframes. Be precise with numbers.",
	"trader":            "You are a trading specialist. Your role is evaluating trade opportunities: entry/exit points, position sizing, risk/reward ratios, and execution strategy. When given a trade evaluation, consider the current market conditions, liquidity, slippage, and timing. Always include risk warnings.",
	// Sports
	"fantasy-manager":   "You are a fantasy sports analyst. You analyze player stats, matchups, injury reports, and roster optimization. Use web_search for current player news and stats. Provide specific recommendations for lineup decisions, waiver wire picks, and trade targets.",
	"gambling-guru":     "You are a sports odds analyst. You analyze betting lines, find value bets, track line movements, and identify market inefficiencies. Use web_search for current odds and injury news. Always include probability assessments and bankroll management advice.",
	"sports-journalist": "You are a sports journalist. You find breaking news, write compelling analysis, and track developing stories. Use web_search to find the latest sports news. Write with flair but back up takes with data.",
	// Career
	"planner":           "You are a career planner and productivity specialist. You manage schedules, set goals, optimize workflows, and keep projects on track. Help users organize their time, prioritize tasks, and build effective routines.",
	"career-analyst":    "You are a career strategy analyst. You research salary benchmarks, analyze job markets, identify skill gaps, and map career paths. Use web_search for current market data. Provide data-driven career advice.",
	"networking-growth": "You are a networking and growth specialist. You craft outreach strategies, optimize LinkedIn profiles, build relationship management systems, and identify networking opportunities. Help users expand their professional network strategically.",
	// Product & Business
	"cto":               "You are a CTO and technical leader. You evaluate architectures, review technical decisions, plan engineering roadmaps, and assess technology stacks. Provide specific technical guidance with tradeoff analysis.",
	"growth-hacker":     "You are a growth hacker and marketing specialist. You design viral campaigns, optimize conversion funnels, plan content strategies, and analyze user acquisition channels. Use web_search for current trends and competitor analysis.",
	"cfo":               "You are a CFO and financial strategist. You build financial models, analyze unit economics, plan fundraising strategies, manage budgets, and forecast runway. Be precise with numbers and realistic with projections.",
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
	if len(body.Specialists) > 0 {
		for _, spec := range body.Specialists {
			specDescriptions = append(specDescriptions, fmt.Sprintf("- %s (%s): %s", spec.Name, spec.Role, spec.Description))
		}
	} else {
		// Legacy path: specialist_names only
		for i, name := range body.SpecialistNames {
			specDescriptions = append(specDescriptions, fmt.Sprintf("- %s (Specialist %d)", name, i+1))
		}
	}

	leadInstructions := fmt.Sprintf(`You are %s, the %s of an AI team.

YOUR TEAM:
%s

COORDINATION RULES:
- When the user asks a complex question, use dispatch_specialist to delegate to the right team member
- You can dispatch to multiple specialists for multi-faceted questions
- Always mention which specialist you're delegating to by name
- Synthesize specialist results into clear, actionable responses
- If a question is simple, answer it yourself without dispatching
- Make the user feel like they have a full team working for them`,
		body.LeadName, leadRole, strings.Join(specDescriptions, "\n"))

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
			if detailed, ok := detailedPrompts[spec.CharacterID]; ok {
				specPrompt = fmt.Sprintf("You are %s. %s", spec.Name, detailed)
			}

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
