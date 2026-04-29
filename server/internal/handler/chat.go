package handler

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/bifrost"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/tools"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/wallet"
)

type teamMember struct {
	ID           uuid.UUID
	Name         string
	Description  *string
	Instructions *string
	Model        *string
}

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

// resolveModel strips provider prefix (e.g. "anthropic/claude-sonnet-4-6" → "claude-sonnet-4-6")
func resolveModel(model string) string {
	if i := strings.LastIndex(model, "/"); i >= 0 {
		return model[i+1:]
	}
	return model
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
	useSSE := strings.Contains(r.Header.Get("Accept"), "text/event-stream")

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

	// Auto-title session from first user message
	title := strings.TrimSpace(body.Content)
	if len(title) > 40 {
		title = title[:40] + "..."
	}
	h.DB.Exec(ctx,
		`UPDATE chat_session SET title = $1 WHERE id = $2 AND title IS NULL`,
		title, sessionID)

	// Load agent instructions + model
	var agentInstructions *string
	var agentModel *string
	var agentName string
	h.DB.QueryRow(ctx,
		`SELECT name, instructions, model FROM agent WHERE id = $1 AND workspace_id = $2`,
		agentID, wsID).Scan(&agentName, &agentInstructions, &agentModel)

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

	// Build system prompt with memory injection
	var systemPrompt string
	basePrompt := "You have persistent memory that carries across conversations. When users tell you things to remember, you WILL remember them in future sessions. Your memory is shown below under '## Your Memory'. Trust it — it is real and accurate."
	if agentInstructions != nil && *agentInstructions != "" {
		systemPrompt = fmt.Sprintf("You are %s. %s\n\n%s", agentName, *agentInstructions, basePrompt)
	} else if agentName != "" {
		systemPrompt = fmt.Sprintf("You are %s.\n\n%s", agentName, basePrompt)
	} else {
		systemPrompt = basePrompt
	}

	// Load assigned skills and inject into system prompt
	skillRows, skillErr := h.DB.Query(ctx,
		`SELECT s.name, s.content FROM skill s
		 JOIN agent_skill as2 ON as2.skill_id = s.id
		 WHERE as2.agent_id = $1 AND as2.enabled = true
		 ORDER BY as2.priority DESC`, agentID)
	if skillErr == nil {
		defer skillRows.Close()
		var skillSection strings.Builder
		for skillRows.Next() {
			var sName, sContent string
			if skillRows.Scan(&sName, &sContent) == nil {
				skillSection.WriteString(fmt.Sprintf("### %s\n%s\n\n", sName, sContent))
			}
		}
		if skillSection.Len() > 0 {
			systemPrompt += "\n\n## Skills\n" + skillSection.String()
		}
	}

	// Load document chunks for context injection
	docRows, docErr := h.DB.Query(ctx,
		`SELECT dc.content FROM document_chunk dc
		 JOIN document d ON d.id = dc.document_id
		 WHERE d.workspace_id = $1 AND d.status = 'ready'
		 ORDER BY dc.document_id, dc.chunk_index LIMIT 20`, wsID)
	if docErr == nil {
		defer docRows.Close()
		var docContext strings.Builder
		for docRows.Next() {
			var c string
			if docRows.Scan(&c) == nil {
				docContext.WriteString(c + "\n\n")
			}
		}
		if docContext.Len() > 0 {
			dc := docContext.String()
			if len(dc) > 3000 {
				dc = dc[:3000] + "\n..."
			}
			systemPrompt += "\n\n## Document Context\n" + dc
		}
	}

	// Check if this message was triggered by a prompt action (system prompt override)
	actionSlug := r.Header.Get("X-Prompt-Action-Slug")
	if actionSlug != "" {
		var sysOverride string
		overrideErr := h.DB.QueryRow(ctx,
			"SELECT system_prompt_override FROM prompt_action WHERE slug = $1 AND system_prompt_override IS NOT NULL",
			actionSlug).Scan(&sysOverride)
		if overrideErr == nil && sysOverride != "" {
			systemPrompt = sysOverride + "\n\n" + systemPrompt
		}
	}

	// Retrieve and inject relevant memories
	memoryContext := h.retrieveMemories(ctx, agentID, body.Content)
	h.Logger.Info().Str("agent_id", agentID.String()).Int("memory_len", len(memoryContext)).Str("memory_preview", memoryContext[:min(len(memoryContext), 100)]).Msg("memory context loaded")
	if memoryContext != "" {
		systemPrompt += "\n\n## Your Memory\n" + memoryContext
	}

	var messages []bifrost.Message
	if systemPrompt != "" {
		messages = append(messages, bifrost.Message{Role: "system", Content: systemPrompt})
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

	// Determine model — strip provider prefix
	model := "claude-sonnet-4-6"
	if agentModel != nil && *agentModel != "" {
		model = resolveModel(*agentModel)
	}

	assistantMsgID := uuid.New()

	// Load team members (sub-agents) to check if this agent is a team lead
	var teamMembers []teamMember
	tmRows, _ := h.DB.Query(ctx,
		"SELECT id, name, description, instructions, model FROM agent WHERE parent_agent_id = $1 AND workspace_id = $2 AND archived_at IS NULL",
		agentID, wsID)
	if tmRows != nil {
		defer tmRows.Close()
		for tmRows.Next() {
			var m teamMember
			tmRows.Scan(&m.ID, &m.Name, &m.Description, &m.Instructions, &m.Model)
			teamMembers = append(teamMembers, m)
		}
	}

	// Define available tools
	var availableTools []bifrost.ToolDef
	if h.PerplexityAPIKey != "" {
		availableTools = append(availableTools, bifrost.ToolDef{
			Name:        "web_search",
			Description: "Search the web for current information. Use for prices, news, market data, or anything requiring up-to-date info.",
			Parameters: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"query": map[string]interface{}{
						"type":        "string",
						"description": "Search query",
					},
				},
				"required": []string{"query"},
			},
		})
	}

	// Add wallet_propose tool if agent has an active wallet
	var hasWallet bool
	h.DB.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM wallet WHERE agent_id = $1 AND workspace_id = $2 AND status = 'active')`,
		agentID, wsID).Scan(&hasWallet)
	if hasWallet && h.Jupiter != nil {
		availableTools = append(availableTools, bifrost.ToolDef{
			Name:        "wallet_propose",
			Description: "Propose a cryptocurrency swap transaction. The policy engine will validate it before execution.",
			Parameters: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"action":       map[string]interface{}{"type": "string", "enum": []string{"swap"}, "description": "Transaction type"},
					"input_token":  map[string]interface{}{"type": "string", "enum": []string{"SOL", "USDC"}, "description": "Token to sell"},
					"output_token": map[string]interface{}{"type": "string", "enum": []string{"SOL", "USDC"}, "description": "Token to buy"},
					"amount":       map[string]interface{}{"type": "string", "description": "Amount of input token to swap (e.g. '25' for 25 USDC)"},
				},
				"required": []string{"action", "input_token", "output_token", "amount"},
			},
		})
	}

	// Add wallet_execute tool for confirming pending swaps
	if hasWallet && h.Jupiter != nil {
		availableTools = append(availableTools, bifrost.ToolDef{
			Name:        "wallet_execute",
			Description: "Execute a previously proposed and user-confirmed swap transaction. Only call this AFTER the user has explicitly confirmed they want to proceed.",
			Parameters: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"confirm": map[string]interface{}{"type": "boolean", "description": "Must be true to execute"},
				},
				"required": []string{"confirm"},
			},
		})
	}

	// Add dispatch_specialist tool if this agent leads a team
	if len(teamMembers) > 0 {
		specNames := []string{}
		for _, m := range teamMembers {
			specNames = append(specNames, m.Name)
		}
		availableTools = append(availableTools, bifrost.ToolDef{
			Name:        "dispatch_specialist",
			Description: "Delegate a task to one of your team specialists. They will research/analyze and return findings.",
			Parameters: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"specialist": map[string]interface{}{
						"type": "string", "enum": specNames,
						"description": "Name of the specialist to dispatch",
					},
					"task": map[string]interface{}{
						"type":        "string",
						"description": "Specific task for the specialist",
					},
				},
				"required": []string{"specialist", "task"},
			},
		})

		// Add team awareness to system prompt
		teamSection := "\n\n## Your Team\nYou lead a team of specialists. Use dispatch_specialist to delegate:\n"
		for _, m := range teamMembers {
			desc := "Specialist"
			if m.Description != nil {
				desc = *m.Description
			}
			teamSection += fmt.Sprintf("- **%s**: %s\n", m.Name, desc)
		}
		teamSection += "\nBreak complex questions into specialist tasks. Synthesize their results."
		systemPrompt += teamSection
	}

	// Try tool use flow: non-streaming first call with tools, then stream final response
	if len(availableTools) > 0 {
		firstResp, err := h.Router.Route(ctx, bifrost.CompletionRequest{
			Model:     model,
			Messages:  messages,
			Tools:     availableTools,
			MaxTokens: 4096,
		})

		if err == nil && len(firstResp.ToolCalls) > 0 {
			h.Logger.Info().Int("tool_calls", len(firstResp.ToolCalls)).Msg("tool use detected")

			// Build assistant message with tool_use blocks
			assistantParts := []bifrost.ContentPart{}
			if firstResp.Content != "" {
				assistantParts = append(assistantParts, bifrost.ContentPart{Type: "text", Text: firstResp.Content})
			}
			for _, tc := range firstResp.ToolCalls {
				assistantParts = append(assistantParts, bifrost.ContentPart{
					Type:  "tool_use",
					ID:    tc.ID,
					Name:  tc.Name,
					Input: tc.Input,
				})
			}
			messages = append(messages, bifrost.Message{Role: "assistant", ContentParts: assistantParts})

			// Execute tools and build tool_result parts
			// Set up SSE flusher for tool events
			var sseFlusher http.Flusher
			if useSSE {
				w.Header().Set("Content-Type", "text/event-stream")
				w.Header().Set("Cache-Control", "no-cache")
				w.Header().Set("Connection", "keep-alive")
				w.WriteHeader(http.StatusOK)
				sseFlusher, _ = w.(http.Flusher)
				// message_start
				fmt.Fprintf(w, "data: {\"type\":\"message_start\",\"message_id\":\"%s\"}\n\n", assistantMsgID)
				if sseFlusher != nil { sseFlusher.Flush() }
			}

			toolResultParts := []bifrost.ContentPart{}
			totalTools := len(firstResp.ToolCalls)
			for toolIdx, tc := range firstResp.ToolCalls {
				// Emit action_progress if triggered by a prompt action
				if actionSlug != "" && useSSE && sseFlusher != nil {
					escapedName := strings.ReplaceAll(tc.Name, "\"", "\\\"")
					fmt.Fprintf(w, "data: {\"type\":\"action_progress\",\"step\":%d,\"total\":%d,\"label\":\"%s processing...\"}\n\n",
						toolIdx+1, totalTools+1, escapedName)
					sseFlusher.Flush()
				}
				var result string
				switch tc.Name {
				case "web_search":
					var input struct {
						Query string `json:"query"`
					}
					json.Unmarshal(tc.Input, &input)
					// Emit tool_use_start SSE event
					if useSSE && sseFlusher != nil {
						escQ := strings.ReplaceAll(input.Query, "\"", "\\\"")
						fmt.Fprintf(w, "data: {\"type\":\"tool_use_start\",\"tool\":\"web_search\",\"query\":\"%s\"}\n\n", escQ)
						sseFlusher.Flush()
					}
					if input.Query != "" {
						h.Logger.Info().Str("query", input.Query).Msg("executing web search")
						result, err = tools.WebSearch(ctx, h.PerplexityAPIKey, input.Query)
						if err != nil {
							h.Logger.Error().Err(err).Msg("web search failed")
							result = "Search failed: " + err.Error()
						}
					} else {
						result = "No query provided"
					}
					// Emit tool_use_end SSE event
					if useSSE && sseFlusher != nil {
						preview := result
						if len(preview) > 100 { preview = preview[:100] + "..." }
						preview = strings.ReplaceAll(preview, "\"", "\\\"")
						preview = strings.ReplaceAll(preview, "\n", " ")
						fmt.Fprintf(w, "data: {\"type\":\"tool_use_end\",\"tool\":\"web_search\",\"result_preview\":\"%s\"}\n\n", preview)
						sseFlusher.Flush()
					}
				case "wallet_propose":
					result = h.handleWalletProposeTool(ctx, tc, agentID, wsID, sessionID, assistantMsgID, useSSE, sseFlusher, w)
				case "wallet_execute":
					result = h.handleWalletExecuteTool(ctx, tc, agentID, wsID, sessionID, useSSE, sseFlusher, w)
				case "dispatch_specialist":
					result = h.handleDispatchSpecialist(ctx, tc, teamMembers, agentID, wsID, sessionID, useSSE, sseFlusher, w)
				default:
					result = "Unknown tool: " + tc.Name
				}
				toolResultParts = append(toolResultParts, bifrost.ContentPart{
					Type:      "tool_result",
					ToolUseID: tc.ID,
					Content:   result,
				})
			}
			messages = append(messages, bifrost.Message{Role: "user", ContentParts: toolResultParts})

			// Emit final progress step: synthesizing
			if actionSlug != "" && useSSE && sseFlusher != nil {
				fmt.Fprintf(w, "data: {\"type\":\"action_progress\",\"step\":%d,\"total\":%d,\"label\":\"Synthesizing response...\"}\n\n",
					totalTools+1, totalTools+1)
				sseFlusher.Flush()
			}

			// Second call: stream final response without tools
			ch := make(chan bifrost.StreamChunk, 64)
			secondReq := bifrost.CompletionRequest{
				Model:     model,
				Messages:  messages,
				MaxTokens: 4096,
				Stream:    true,
			}

			go func() {
				h.Router.StreamRoute(ctx, secondReq, ch)
			}()

			if useSSE && sseFlusher != nil {
				// Continue SSE stream (headers already written, message_start already sent)
				var fullContent strings.Builder
				var inputTokens, outputTokens int
				for chunk := range ch {
					if chunk.Delta != "" {
						fullContent.WriteString(chunk.Delta)
						escaped := strings.ReplaceAll(chunk.Delta, "\\", "\\\\")
						escaped = strings.ReplaceAll(escaped, "\"", "\\\"")
						escaped = strings.ReplaceAll(escaped, "\n", "\\n")
						fmt.Fprintf(w, "data: {\"type\":\"content_delta\",\"delta\":\"%s\"}\n\n", escaped)
						sseFlusher.Flush()
					}
					if chunk.Usage != nil {
						inputTokens = chunk.Usage.InputTokens
						outputTokens = chunk.Usage.OutputTokens
					}
				}
				responseText := fullContent.String()

				// Emit specialist_active for any team members mentioned
				h.emitSpecialistActive(ctx, agentID, responseText, w, sseFlusher)

				fmt.Fprintf(w, "data: {\"type\":\"message_end\",\"usage\":{\"input_tokens\":%d,\"output_tokens\":%d}}\n\n", inputTokens, outputTokens)
				sseFlusher.Flush()

				h.DB.Exec(ctx,
					`INSERT INTO chat_message (id, chat_session_id, workspace_id, role, content, input_tokens, output_tokens, model)
					 VALUES ($1, $2, $3, 'assistant', $4, $5, $6, $7)`,
					assistantMsgID, sessionID, wsID, responseText, inputTokens, outputTokens, model)
				h.extractAndStoreMemories(agentID, wsID, sessionID.String(), body.Content, responseText)
				return
			}

			// Non-SSE tool-use path: collect and return JSON
			var fullContent strings.Builder
			for chunk := range ch {
				fullContent.WriteString(chunk.Delta)
			}
			responseText := fullContent.String()
			var savedMsg messageRow
			h.DB.QueryRow(ctx,
				`INSERT INTO chat_message (id, chat_session_id, workspace_id, role, content, model)
				 VALUES ($1, $2, $3, 'assistant', $4, $5)
				 RETURNING id, chat_session_id, workspace_id, role, content, input_tokens, output_tokens, model, created_at`,
				assistantMsgID, sessionID, wsID, responseText, model).Scan(
				&savedMsg.ID, &savedMsg.ChatSessionID, &savedMsg.WorkspaceID, &savedMsg.Role, &savedMsg.Content,
				&savedMsg.InputTokens, &savedMsg.OutputTokens, &savedMsg.Model, &savedMsg.CreatedAt)
			h.extractAndStoreMemories(agentID, wsID, sessionID.String(), body.Content, responseText)
			writeJSON(w, http.StatusOK, savedMsg)
			return
		}
		// If no tool calls or error, fall through to normal streaming
		if err != nil {
			h.Logger.Warn().Err(err).Msg("tool-use first call failed, falling back to normal stream")
		}
	}

	// Normal streaming (no tools or tool call fallback)
	ch := make(chan bifrost.StreamChunk, 64)
	req := bifrost.CompletionRequest{
		Model:     model,
		Messages:  messages,
		MaxTokens: 4096,
		Stream:    true,
	}

	streamErr := make(chan error, 1)
	go func() {
		streamErr <- h.Router.StreamRoute(ctx, req, ch)
	}()

	h.streamResponse(w, r, ch, streamErr, wsID, sessionID, assistantMsgID, model, agentID, body.Content, useSSE)
}

// streamResponse handles SSE and non-SSE streaming of a bifrost stream channel to the HTTP response.
func (h *Handler) streamResponse(
	w http.ResponseWriter, r *http.Request,
	ch <-chan bifrost.StreamChunk, streamErr <-chan error,
	wsID, sessionID, assistantMsgID uuid.UUID,
	model string, agentID uuid.UUID, userContent string,
	useSSE bool,
) {
	ctx := r.Context()

	// SSE mode: stream events directly to HTTP response
	if useSSE {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.WriteHeader(http.StatusOK)

		flusher, _ := w.(http.Flusher)

		// message_start
		fmt.Fprintf(w, "data: {\"type\":\"message_start\",\"message_id\":\"%s\"}\n\n", assistantMsgID)
		if flusher != nil {
			flusher.Flush()
		}

		var fullContent strings.Builder
		var inputTokens, outputTokens int

		for chunk := range ch {
			if chunk.Delta != "" {
				fullContent.WriteString(chunk.Delta)
				// Escape for JSON
				escaped := strings.ReplaceAll(chunk.Delta, "\\", "\\\\")
				escaped = strings.ReplaceAll(escaped, "\"", "\\\"")
				escaped = strings.ReplaceAll(escaped, "\n", "\\n")
				fmt.Fprintf(w, "data: {\"type\":\"content_delta\",\"delta\":\"%s\"}\n\n", escaped)
				if flusher != nil {
					flusher.Flush()
				}
			}
			if chunk.Usage != nil {
				inputTokens = chunk.Usage.InputTokens
				outputTokens = chunk.Usage.OutputTokens
			}

			// Also broadcast via WebSocket
			if chunk.Delta != "" {
				h.Hub.BroadcastEvent(wsID.String(), "chat:message_delta", map[string]interface{}{
					"session_id": sessionID.String(),
					"message_id": assistantMsgID.String(),
					"delta":      chunk.Delta,
				})
			}
		}

		// Emit specialist_active for any team members mentioned
		responseText := fullContent.String()
		h.emitSpecialistActive(ctx, agentID, responseText, w, flusher)

		// message_end
		fmt.Fprintf(w, "data: {\"type\":\"message_end\",\"usage\":{\"input_tokens\":%d,\"output_tokens\":%d}}\n\n",
			inputTokens, outputTokens)
		if flusher != nil {
			flusher.Flush()
		}
		h.DB.Exec(ctx,
			`INSERT INTO chat_message (id, chat_session_id, workspace_id, role, content, input_tokens, output_tokens, model)
			 VALUES ($1, $2, $3, 'assistant', $4, $5, $6, $7)`,
			assistantMsgID, sessionID, wsID, responseText, inputTokens, outputTokens, model)

		// Async memory extraction
		h.Logger.Info().Str("agent_id", agentID.String()).Int("response_len", len(responseText)).Msg("triggering memory extraction from SSE path")
		h.extractAndStoreMemories(agentID, wsID, sessionID.String(), userContent, responseText)

		return
	}

	// Non-SSE mode: collect full response, return JSON
	h.Hub.BroadcastEvent(wsID.String(), "chat:message_start", map[string]interface{}{
		"session_id": sessionID.String(),
		"message_id": assistantMsgID.String(),
	})

	var fullContent strings.Builder
	var inputTokens, outputTokens int

	for chunk := range ch {
		fullContent.WriteString(chunk.Delta)
		if chunk.Usage != nil {
			inputTokens = chunk.Usage.InputTokens
			outputTokens = chunk.Usage.OutputTokens
		}

		if chunk.Delta != "" {
			h.Hub.BroadcastEvent(wsID.String(), "chat:message_delta", map[string]interface{}{
				"session_id": sessionID.String(),
				"message_id": assistantMsgID.String(),
				"delta":      chunk.Delta,
			})
		}
	}

	h.Hub.BroadcastEvent(wsID.String(), "chat:message_end", map[string]interface{}{
		"session_id": sessionID.String(),
		"message_id": assistantMsgID.String(),
		"content":    fullContent.String(),
	})

	responseText := fullContent.String()
	var savedMsg messageRow
	err := h.DB.QueryRow(ctx,
		`INSERT INTO chat_message (id, chat_session_id, workspace_id, role, content, input_tokens, output_tokens, model)
		 VALUES ($1, $2, $3, 'assistant', $4, $5, $6, $7)
		 RETURNING id, chat_session_id, workspace_id, role, content, input_tokens, output_tokens, model, created_at`,
		assistantMsgID, sessionID, wsID, responseText, inputTokens, outputTokens, model).Scan(
		&savedMsg.ID, &savedMsg.ChatSessionID, &savedMsg.WorkspaceID, &savedMsg.Role, &savedMsg.Content,
		&savedMsg.InputTokens, &savedMsg.OutputTokens, &savedMsg.Model, &savedMsg.CreatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to insert assistant message")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	// Async memory extraction
	h.extractAndStoreMemories(agentID, wsID, sessionID.String(), userContent, responseText)

	writeJSON(w, http.StatusOK, savedMsg)
}

// emitSpecialistActive checks if any team member names are mentioned in the response
// and emits specialist_active SSE events for the frontend roster strip flash.
func (h *Handler) emitSpecialistActive(ctx context.Context, agentID uuid.UUID, responseText string, w http.ResponseWriter, flusher http.Flusher) {
	subRows, err := h.DB.Query(ctx,
		`SELECT id, name FROM agent WHERE parent_agent_id = $1 AND archived_at IS NULL`, agentID)
	if err != nil || subRows == nil {
		return
	}
	defer subRows.Close()
	for subRows.Next() {
		var subID, subName string
		if err := subRows.Scan(&subID, &subName); err != nil {
			continue
		}
		if strings.Contains(responseText, subName) {
			fmt.Fprintf(w, "data: {\"type\":\"specialist_active\",\"agent_id\":\"%s\",\"name\":\"%s\"}\n\n", subID, subName)
			if flusher != nil {
				flusher.Flush()
			}
		}
	}
}

// handleDispatchSpecialist delegates a task to a specialist sub-agent and returns their response.
func (h *Handler) handleDispatchSpecialist(
	ctx context.Context, tc bifrost.ToolCall,
	members []teamMember, agentID, wsID, sessionID uuid.UUID,
	useSSE bool, sseFlusher http.Flusher, w http.ResponseWriter,
) string {
	var input struct {
		Specialist string `json:"specialist"`
		Task       string `json:"task"`
	}
	json.Unmarshal(tc.Input, &input)

	// Find specialist
	var spec *teamMember
	for i := range members {
		if members[i].Name == input.Specialist {
			spec = &members[i]
			break
		}
	}
	if spec == nil {
		return "Unknown specialist: " + input.Specialist
	}

	// SSE: dispatch_start
	if useSSE && sseFlusher != nil {
		escapedTask := strings.ReplaceAll(input.Task, "\"", "\\\"")
		escapedTask = strings.ReplaceAll(escapedTask, "\n", " ")
		fmt.Fprintf(w, "data: {\"type\":\"dispatch_start\",\"specialist\":\"%s\",\"specialist_id\":\"%s\",\"task\":\"%s\"}\n\n",
			input.Specialist, spec.ID.String(), escapedTask)
		sseFlusher.Flush()
	}

	// Record task
	var taskID uuid.UUID
	h.DB.QueryRow(ctx,
		`INSERT INTO dispatch_task (workspace_id, chat_session_id, from_agent_id, to_agent_id, description, status, started_at)
		 VALUES ($1, $2, $3, $4, $5, 'running', now()) RETURNING id`,
		wsID, sessionID, agentID, spec.ID, input.Task).Scan(&taskID)

	// Build specialist prompt
	specSystem := fmt.Sprintf("You are %s, a specialist agent.", spec.Name)
	if spec.Instructions != nil && *spec.Instructions != "" {
		specSystem = fmt.Sprintf("You are %s. %s", spec.Name, *spec.Instructions)
	}

	// Load specialist skills
	sRows, _ := h.DB.Query(ctx,
		`SELECT s.name, s.content FROM skill s JOIN agent_skill a ON a.skill_id = s.id
		 WHERE a.agent_id = $1 AND a.enabled = true`, spec.ID)
	if sRows != nil {
		defer sRows.Close()
		var sb strings.Builder
		for sRows.Next() {
			var sn, sc string
			if sRows.Scan(&sn, &sc) == nil {
				sb.WriteString(fmt.Sprintf("### %s\n%s\n\n", sn, sc))
			}
		}
		if sb.Len() > 0 {
			specSystem += "\n\n## Skills\n" + sb.String()
		}
	}

	specSystem += "\n\nComplete the task thoroughly. Be specific and data-driven."

	// Specialist tools (web search)
	specTools := []bifrost.ToolDef{}
	if h.PerplexityAPIKey != "" {
		specTools = append(specTools, bifrost.ToolDef{
			Name:        "web_search",
			Description: "Search the web for current information.",
			Parameters: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"query": map[string]interface{}{"type": "string", "description": "Search query"},
				},
				"required": []string{"query"},
			},
		})
	}

	specModel := "claude-sonnet-4-6"
	if spec.Model != nil && *spec.Model != "" {
		specModel = resolveModel(*spec.Model)
	}

	specMessages := []bifrost.Message{
		{Role: "system", Content: specSystem},
		{Role: "user", Content: input.Task},
	}

	// First call
	specResp, err := h.Router.Route(ctx, bifrost.CompletionRequest{
		Model: specModel, Messages: specMessages, Tools: specTools, MaxTokens: 4096,
	})

	var result string
	if err != nil {
		result = "Specialist error: " + err.Error()
		h.DB.Exec(ctx, `UPDATE dispatch_task SET status='failed', result=$1, completed_at=now() WHERE id=$2`, result, taskID)
	} else if len(specResp.ToolCalls) > 0 {
		// Handle specialist tool calls (one level only)
		assistParts := []bifrost.ContentPart{}
		if specResp.Content != "" {
			assistParts = append(assistParts, bifrost.ContentPart{Type: "text", Text: specResp.Content})
		}
		for _, stc := range specResp.ToolCalls {
			assistParts = append(assistParts, bifrost.ContentPart{Type: "tool_use", ID: stc.ID, Name: stc.Name, Input: stc.Input})
		}
		specMessages = append(specMessages, bifrost.Message{Role: "assistant", ContentParts: assistParts})

		toolResults := []bifrost.ContentPart{}
		for _, stc := range specResp.ToolCalls {
			var tr string
			if stc.Name == "web_search" {
				var si struct {
					Query string `json:"query"`
				}
				json.Unmarshal(stc.Input, &si)
				if si.Query != "" {
					if useSSE && sseFlusher != nil {
						fmt.Fprintf(w, "data: {\"type\":\"dispatch_tool\",\"specialist\":\"%s\",\"tool\":\"web_search\",\"query\":\"%s\"}\n\n",
							input.Specialist, strings.ReplaceAll(si.Query, "\"", "\\\""))
						sseFlusher.Flush()
					}
					tr, _ = tools.WebSearch(ctx, h.PerplexityAPIKey, si.Query)
				}
			}
			if tr == "" {
				tr = "No result"
			}
			toolResults = append(toolResults, bifrost.ContentPart{Type: "tool_result", ToolUseID: stc.ID, Content: tr})
		}
		specMessages = append(specMessages, bifrost.Message{Role: "user", ContentParts: toolResults})

		specResp2, err2 := h.Router.Route(ctx, bifrost.CompletionRequest{
			Model: specModel, Messages: specMessages, MaxTokens: 4096,
		})
		if err2 == nil {
			result = specResp2.Content
		} else {
			result = specResp.Content
		}
		h.DB.Exec(ctx, `UPDATE dispatch_task SET status='completed', result=$1, completed_at=now() WHERE id=$2`, result, taskID)
	} else {
		result = specResp.Content
		h.DB.Exec(ctx, `UPDATE dispatch_task SET status='completed', result=$1, input_tokens=$2, output_tokens=$3, completed_at=now() WHERE id=$4`,
			result, specResp.Usage.InputTokens, specResp.Usage.OutputTokens, taskID)
	}

	// SSE: dispatch_end
	if useSSE && sseFlusher != nil {
		fmt.Fprintf(w, "data: {\"type\":\"dispatch_end\",\"specialist\":\"%s\",\"specialist_id\":\"%s\",\"status\":\"completed\"}\n\n",
			input.Specialist, spec.ID.String())
		sseFlusher.Flush()
	}

	return result
}

// handleWalletProposeTool processes the wallet_propose tool call from the LLM.
// Gets real Jupiter quote, runs real policy engine, records transaction.
// If ENABLE_LIVE_TRADING=true and Vault is configured, signs and submits on-chain.
func (h *Handler) handleWalletProposeTool(
	ctx context.Context, tc bifrost.ToolCall,
	agentID, wsID, sessionID, assistantMsgID uuid.UUID,
	useSSE bool, sseFlusher http.Flusher, w http.ResponseWriter,
) string {
	// Emit SSE event
	if useSSE && sseFlusher != nil {
		fmt.Fprintf(w, "data: {\"type\":\"tool_use_start\",\"tool\":\"wallet_propose\",\"query\":\"evaluating swap proposal\"}\n\n")
		sseFlusher.Flush()
	}

	var input struct {
		Action      string `json:"action"`
		InputToken  string `json:"input_token"`
		OutputToken string `json:"output_token"`
		Amount      string `json:"amount"`
	}
	if err := json.Unmarshal(tc.Input, &input); err != nil {
		return "Invalid input format"
	}

	// Validate amount
	amount, err := decimal.NewFromString(input.Amount)
	if err != nil || amount.LessThanOrEqual(decimal.Zero) {
		return "Invalid amount: must be a positive number"
	}

	// Validate tokens
	if _, ok := wallet.TokenMints[input.InputToken]; !ok {
		return "Invalid input token: " + input.InputToken
	}
	if _, ok := wallet.TokenMints[input.OutputToken]; !ok {
		return "Invalid output token: " + input.OutputToken
	}
	if input.InputToken == input.OutputToken {
		return "Input and output tokens must be different"
	}

	// Look up agent's wallet
	var walletID uuid.UUID
	var publicKey string
	err = h.DB.QueryRow(ctx,
		`SELECT w.id, w.public_key FROM wallet w WHERE w.agent_id = $1 AND w.status = 'active'`,
		agentID).Scan(&walletID, &publicKey)
	if err != nil {
		return "Agent has no active wallet"
	}

	// Get Jupiter quote for price estimation
	inputMint := wallet.TokenMints[input.InputToken]
	outputMint := wallet.TokenMints[input.OutputToken]
	// SOL has 9 decimals, USDC has 6
	var lamports uint64
	if input.InputToken == "SOL" {
		lamports = uint64(amount.Mul(decimal.NewFromInt(1e9)).IntPart())
	} else {
		lamports = uint64(amount.Mul(decimal.NewFromInt(1e6)).IntPart())
	}

	quote, err := h.Jupiter.GetQuote(ctx, inputMint, outputMint, lamports, 100) // 1% slippage
	if err != nil {
		h.Logger.Error().Err(err).Msg("jupiter quote failed")
		return "Failed to get price quote: " + err.Error()
	}

	// Convert output amount from smallest units to human-readable
	outAmountRaw, _ := decimal.NewFromString(quote.OutAmount)
	var outAmountHuman decimal.Decimal
	if input.OutputToken == "SOL" {
		outAmountHuman = outAmountRaw.Div(decimal.NewFromInt(1e9))
	} else {
		outAmountHuman = outAmountRaw.Div(decimal.NewFromInt(1e6))
	}
	outAmountStr := outAmountHuman.StringFixed(6)

	// Emit wallet_propose SSE event with quote details
	if useSSE && sseFlusher != nil {
		fmt.Fprintf(w, "data: {\"type\":\"wallet_propose\",\"action\":\"%s\",\"input_token\":\"%s\",\"output_token\":\"%s\",\"amount\":\"%s\",\"output_amount\":\"%s\"}\n\n",
			input.Action, input.InputToken, input.OutputToken, input.Amount, outAmountStr)
		sseFlusher.Flush()
	}

	// Estimate USD value for policy engine
	// For USDC, amount IS USD. For SOL, use conservative $200/SOL estimate.
	estimatedUSD := amount
	if input.InputToken == "SOL" {
		estimatedUSD = amount.Mul(decimal.NewFromInt(200))
	}

	// Run policy engine
	proposal := wallet.TxProposal{
		WalletID:    walletID,
		Action:      input.Action,
		InputToken:  input.InputToken,
		OutputToken: input.OutputToken,
		AmountUSD:   estimatedUSD,
		InputAmount: input.Amount,
	}

	approved, checks, err := h.PolicyEngine.EvaluateProposal(ctx, walletID, proposal)
	if err != nil {
		h.Logger.Error().Err(err).Msg("policy evaluation failed")
		return "Policy evaluation error: " + err.Error()
	}

	// Emit wallet_policy SSE event
	if useSSE && sseFlusher != nil {
		checksJSON, _ := json.Marshal(checks)
		fmt.Fprintf(w, "data: {\"type\":\"wallet_policy\",\"approved\":%t,\"checks\":%s}\n\n", approved, checksJSON)
		sseFlusher.Flush()
	}

	// Build idempotency key from session + message
	idempKey := fmt.Sprintf("chat:%s:%s", sessionID.String(), assistantMsgID.String())

	// Determine status and blocked reason
	txStatus := "approved"
	blockedReason := ""
	if !approved {
		txStatus = "blocked"
		for _, c := range checks {
			if !c.Passed {
				blockedReason = c.Details
				break
			}
		}
	}

	// Record transaction with idempotency key
	h.DB.Exec(ctx,
		`INSERT INTO wallet_transaction (wallet_id, workspace_id, agent_id, chain, action, status,
		 input_token, input_amount, input_value_usd, output_token, output_amount, blocked_reason, idempotency_key)
		 VALUES ($1, $2, $3, 'solana', $4, $5, $6, $7, $8, $9, $10, $11, $12)
		 ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING`,
		walletID, wsID, agentID, input.Action, txStatus,
		input.InputToken, input.Amount, estimatedUSD,
		input.OutputToken, outAmountStr, blockedReason, idempKey)

	var result string
	if !approved {
		// Format checks for display
		checksStr := ""
		for _, c := range checks {
			status := "PASS"
			if !c.Passed {
				status = "FAIL"
			}
			checksStr += fmt.Sprintf("[%s] %s: %s\n", status, c.Rule, c.Details)
		}
		result = fmt.Sprintf("Transaction BLOCKED by policy engine.\nReason: %s\nChecks:\n%s", blockedReason, checksStr)

		// Emit wallet_blocked SSE event
		if useSSE && sseFlusher != nil {
			escapedReason := strings.ReplaceAll(blockedReason, "\"", "\\\"")
			escapedReason = strings.ReplaceAll(escapedReason, "\n", " ")
			fmt.Fprintf(w, "data: {\"type\":\"wallet_blocked\",\"reason\":\"%s\"}\n\n", escapedReason)
			sseFlusher.Flush()
		}
	} else {
		// Policy approved — save as pending_confirmation and ask user to confirm
		h.DB.Exec(ctx, `UPDATE wallet_transaction SET status = 'pending_confirmation',
			confirmation_expires_at = NOW() + INTERVAL '5 minutes'
			WHERE idempotency_key = $1`, idempKey)

		// Emit wallet_pending SSE event
		if useSSE && sseFlusher != nil {
			fmt.Fprintf(w, "data: {\"type\":\"wallet_pending\",\"idempotency_key\":\"%s\",\"input\":\"%s %s\",\"output\":\"%s %s\"}\n\n",
				idempKey, input.Amount, input.InputToken, outAmountStr, input.OutputToken)
			sseFlusher.Flush()
		}

		if os.Getenv("ENABLE_LIVE_TRADING") == "true" && h.Vault != nil {
			result = fmt.Sprintf("Transaction APPROVED by policy engine.\nQuote: %s %s -> %s %s\nPolicy checks: all passed.\n\n⏳ **Awaiting user confirmation.** The user must confirm this swap before it will be submitted on-chain. Ask the user to confirm or cancel. This quote expires in 5 minutes.",
				input.Amount, input.InputToken, outAmountStr, input.OutputToken)
		} else {
			result = fmt.Sprintf("Transaction APPROVED by policy engine.\nQuote: %s %s -> %s %s\nPolicy checks: all passed\n⚠️ Simulation mode — not submitted on-chain.",
				input.Amount, input.InputToken, outAmountStr, input.OutputToken)
		}
	}

	// Emit SSE end event
	if useSSE && sseFlusher != nil {
		preview := result
		if len(preview) > 100 {
			preview = preview[:100] + "..."
		}
		preview = strings.ReplaceAll(preview, "\"", "\\\"")
		preview = strings.ReplaceAll(preview, "\n", " ")
		fmt.Fprintf(w, "data: {\"type\":\"tool_use_end\",\"tool\":\"wallet_propose\",\"result_preview\":\"%s\"}\n\n", preview)
		sseFlusher.Flush()
	}

	return result
}

// handleWalletExecuteTool processes the wallet_execute tool call from the LLM.
// Finds the most recent pending_confirmation transaction for this session's agent,
// fetches a fresh Jupiter quote, signs, and submits on-chain.
func (h *Handler) handleWalletExecuteTool(
	ctx context.Context, tc bifrost.ToolCall,
	agentID, wsID, sessionID uuid.UUID,
	useSSE bool, sseFlusher http.Flusher, w http.ResponseWriter,
) string {
	if useSSE && sseFlusher != nil {
		fmt.Fprintf(w, "data: {\"type\":\"tool_use_start\",\"tool\":\"wallet_execute\",\"query\":\"executing confirmed swap\"}\n\n")
		sseFlusher.Flush()
	}

	var input struct {
		Confirm bool `json:"confirm"`
	}
	if err := json.Unmarshal(tc.Input, &input); err != nil || !input.Confirm {
		return "Execution cancelled — confirm must be true."
	}

	if os.Getenv("ENABLE_LIVE_TRADING") != "true" || h.Vault == nil {
		return "Live trading is not enabled."
	}

	// Find the most recent pending_confirmation transaction for this agent
	var txID uuid.UUID
	var walletID uuid.UUID
	var inputToken, outputToken, inputAmount string
	err := h.DB.QueryRow(ctx,
		`SELECT wt.id, wt.wallet_id, wt.input_token, wt.output_token, wt.input_amount
		 FROM wallet_transaction wt
		 WHERE wt.agent_id = $1 AND wt.workspace_id = $2
		 AND wt.status = 'pending_confirmation'
		 AND (wt.confirmation_expires_at IS NULL OR wt.confirmation_expires_at > NOW())
		 ORDER BY wt.created_at DESC LIMIT 1`, agentID, wsID).Scan(
		&txID, &walletID, &inputToken, &outputToken, &inputAmount)
	if err != nil {
		return "No pending transaction found to execute. The quote may have expired (5 min window). Please propose a new swap."
	}

	// Get wallet public key
	var publicKey string
	err = h.DB.QueryRow(ctx, `SELECT public_key FROM wallet WHERE id = $1`, walletID).Scan(&publicKey)
	if err != nil {
		return "Failed to load wallet."
	}

	// Fetch fresh Jupiter quote (old one may be stale)
	amount, _ := decimal.NewFromString(inputAmount)
	inputMint := wallet.TokenMints[inputToken]
	outputMint := wallet.TokenMints[outputToken]
	var lamports uint64
	if inputToken == "SOL" {
		lamports = uint64(amount.Mul(decimal.NewFromInt(1e9)).IntPart())
	} else {
		lamports = uint64(amount.Mul(decimal.NewFromInt(1e6)).IntPart())
	}

	quote, err := h.Jupiter.GetQuote(ctx, inputMint, outputMint, lamports, 100)
	if err != nil {
		h.DB.Exec(ctx, `UPDATE wallet_transaction SET status = 'failed', blocked_reason = $1 WHERE id = $2`,
			"fresh quote failed: "+err.Error(), txID)
		return "Failed to get fresh price quote: " + err.Error()
	}

	// Build swap transaction
	swapTxBase64, err := h.Jupiter.GetSwapTransaction(ctx, quote, publicKey)
	if err != nil {
		h.DB.Exec(ctx, `UPDATE wallet_transaction SET status = 'failed', blocked_reason = $1 WHERE id = $2`,
			"swap tx build failed: "+err.Error(), txID)
		return "Transaction build failed: " + err.Error()
	}

	// Sign and submit
	txSig, err := h.signAndSubmitTransaction(ctx, swapTxBase64, walletID, publicKey)
	if err != nil {
		h.DB.Exec(ctx, `UPDATE wallet_transaction SET status = 'failed', blocked_reason = $1 WHERE id = $2`,
			"execution failed: "+err.Error(), txID)
		return fmt.Sprintf("Transaction execution failed: %s", err.Error())
	}

	// Success!
	outAmountRaw, _ := decimal.NewFromString(quote.OutAmount)
	var outAmountHuman decimal.Decimal
	if outputToken == "SOL" {
		outAmountHuman = outAmountRaw.Div(decimal.NewFromInt(1e9))
	} else {
		outAmountHuman = outAmountRaw.Div(decimal.NewFromInt(1e6))
	}

	h.DB.Exec(ctx, `UPDATE wallet_transaction SET status = 'executed', tx_signature = $1, executed_at = NOW(),
		output_amount = $2 WHERE id = $3`, txSig, outAmountHuman.StringFixed(6), txID)

	if useSSE && sseFlusher != nil {
		fmt.Fprintf(w, "data: {\"type\":\"wallet_executed\",\"tx_signature\":\"%s\",\"input\":\"%s %s\",\"output\":\"%s %s\"}\n\n",
			txSig, inputAmount, inputToken, outAmountHuman.StringFixed(6), outputToken)
		sseFlusher.Flush()
	}

	result := fmt.Sprintf("Transaction EXECUTED successfully!\nSwapped: %s %s -> %s %s\nTX: %s\nView: https://solscan.io/tx/%s",
		inputAmount, inputToken, outAmountHuman.StringFixed(6), outputToken, txSig, txSig)

	// Emit SSE end event
	if useSSE && sseFlusher != nil {
		preview := result
		if len(preview) > 100 {
			preview = preview[:100] + "..."
		}
		preview = strings.ReplaceAll(preview, "\"", "\\\"")
		preview = strings.ReplaceAll(preview, "\n", " ")
		fmt.Fprintf(w, "data: {\"type\":\"tool_use_end\",\"tool\":\"wallet_execute\",\"result_preview\":\"%s\"}\n\n", preview)
		sseFlusher.Flush()
	}

	return result
}

// signAndSubmitTransaction decodes a base64 Solana VersionedTransaction, signs it
// with the vault, and submits it to the Solana RPC.
func (h *Handler) signAndSubmitTransaction(ctx context.Context, txBase64 string, walletID uuid.UUID, signerPubkey string) (string, error) {
	// Decode base64 transaction
	txBytes, err := base64.StdEncoding.DecodeString(txBase64)
	if err != nil {
		return "", fmt.Errorf("decode tx: %w", err)
	}

	// Parse Solana transaction structure
	// VersionedTransaction format:
	// [signatures_count (compact-u16)] [signature_0 (64 bytes)] ... [message_bytes]
	// We need to:
	// 1. Parse the number of signatures
	// 2. Find the message bytes (everything after all signatures)
	// 3. Sign the message
	// 4. Insert our signature at the correct position

	offset := 0
	// Parse compact-u16 for signature count
	sigCount, bytesRead := parseCompactU16(txBytes[offset:])
	offset += bytesRead

	// The signatures section is sigCount * 64 bytes
	sigSectionStart := offset
	offset += sigCount * 64

	// Message bytes start here
	messageBytes := txBytes[offset:]

	// Get vault key ID for this wallet
	var vaultKeyID string
	err = h.DB.QueryRow(ctx, `SELECT vault_key_id FROM wallet WHERE id = $1`, walletID).Scan(&vaultKeyID)
	if err != nil {
		return "", fmt.Errorf("load vault key: %w", err)
	}

	// Sign the message
	sig, err := h.Vault.Sign(ctx, vaultKeyID, messageBytes)
	if err != nil {
		return "", fmt.Errorf("vault sign: %w", err)
	}

	// Find our pubkey's position in the account keys to know which signature slot
	// For Jupiter swaps, the fee payer (first signer) is usually our key
	// Place signature at position 0 (first signature slot)
	copy(txBytes[sigSectionStart:sigSectionStart+64], sig)

	// Re-encode as base64
	signedTx := base64.StdEncoding.EncodeToString(txBytes)

	// Submit to Solana RPC
	rpcURL := h.SolanaRPCURL
	if rpcURL == "" {
		rpcURL = "https://api.mainnet-beta.solana.com"
	}

	reqBody, _ := json.Marshal(map[string]interface{}{
		"jsonrpc": "2.0",
		"id":      1,
		"method":  "sendTransaction",
		"params": []interface{}{
			signedTx,
			map[string]interface{}{
				"encoding":      "base64",
				"skipPreflight": false,
				"maxRetries":    3,
			},
		},
	})

	resp, err := http.Post(rpcURL, "application/json", bytes.NewReader(reqBody))
	if err != nil {
		return "", fmt.Errorf("rpc send: %w", err)
	}
	defer resp.Body.Close()

	var rpcResp struct {
		Result string `json:"result"`
		Error  *struct {
			Code    int    `json:"code"`
			Message string `json:"message"`
		} `json:"error"`
	}
	json.NewDecoder(resp.Body).Decode(&rpcResp)

	if rpcResp.Error != nil {
		return "", fmt.Errorf("rpc error %d: %s", rpcResp.Error.Code, rpcResp.Error.Message)
	}

	return rpcResp.Result, nil
}

// parseCompactU16 parses a Solana compact-u16 encoded integer.
func parseCompactU16(data []byte) (int, int) {
	if len(data) == 0 {
		return 0, 0
	}
	val := int(data[0])
	if val < 0x80 {
		return val, 1
	}
	val = (val & 0x7f)
	if len(data) < 2 {
		return val, 1
	}
	val |= int(data[1]&0x7f) << 7
	if data[1] < 0x80 {
		return val, 2
	}
	if len(data) < 3 {
		return val, 2
	}
	val |= int(data[2]&0x03) << 14
	return val, 3
}
