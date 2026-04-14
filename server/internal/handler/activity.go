package handler

import (
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
)

// ActivityEvent represents a single event in the unified activity feed.
type ActivityEvent struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"` // "chat", "memory", "dispatch", "system"
	AgentID   string    `json:"agent_id"`
	AgentName string    `json:"agent_name"`
	AvatarURL string    `json:"avatar_url"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

func stringVal(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// GET /api/agents/{id}/activity
func (h *Handler) handleGetActivity(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	ctx := r.Context()
	events := []ActivityEvent{}

	// Recent chat messages (from lead + all specialists)
	rows, err := h.DB.Query(ctx, `
		SELECT cm.id, cm.role, LEFT(cm.content, 150), cm.created_at,
		       a.id, a.name, a.avatar_url
		FROM chat_message cm
		JOIN chat_session cs ON cm.chat_session_id = cs.id
		JOIN agent a ON cs.agent_id = a.id
		WHERE (cs.agent_id = $1 OR cs.agent_id IN (SELECT id FROM agent WHERE parent_agent_id = $1))
		AND cm.workspace_id = $2
		ORDER BY cm.created_at DESC LIMIT 20
	`, agentID, wsID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var id, role, content, aID, aName string
			var avatarURL *string
			var createdAt time.Time
			if err := rows.Scan(&id, &role, &content, &createdAt, &aID, &aName, &avatarURL); err != nil {
				continue
			}
			events = append(events, ActivityEvent{
				ID:        id,
				Type:      "chat",
				AgentID:   aID,
				AgentName: aName,
				AvatarURL: stringVal(avatarURL),
				Content:   fmt.Sprintf("[%s] %s", role, content),
				CreatedAt: createdAt,
			})
		}
	}

	// Recent memory extractions
	memRows, err := h.DB.Query(ctx, `
		SELECT me.id, me.content, me.created_at, a.id, a.name, a.avatar_url
		FROM memory_entry me
		JOIN agent a ON me.agent_id = a.id
		WHERE (me.agent_id = $1 OR me.agent_id IN (SELECT id FROM agent WHERE parent_agent_id = $1))
		AND me.workspace_id = $2 AND me.source_type = 'extraction'
		ORDER BY me.created_at DESC LIMIT 5
	`, agentID, wsID)
	if err == nil {
		defer memRows.Close()
		for memRows.Next() {
			var id, content, aID, aName string
			var avatarURL *string
			var createdAt time.Time
			if err := memRows.Scan(&id, &content, &createdAt, &aID, &aName, &avatarURL); err != nil {
				continue
			}
			events = append(events, ActivityEvent{
				ID:        id,
				Type:      "memory",
				AgentID:   aID,
				AgentName: aName,
				AvatarURL: stringVal(avatarURL),
				Content:   "Remembered: " + content,
				CreatedAt: createdAt,
			})
		}
	}

	// Recent dispatch tasks
	dtRows, dtErr := h.DB.Query(ctx, `
		SELECT dt.id, dt.description, dt.status, dt.created_at,
		       fa.name as from_name, fa.avatar_url as from_avatar,
		       ta.name as to_name, ta.avatar_url as to_avatar
		FROM dispatch_task dt
		JOIN agent fa ON dt.from_agent_id = fa.id
		JOIN agent ta ON dt.to_agent_id = ta.id
		WHERE (dt.from_agent_id = $1 OR dt.to_agent_id = $1
		       OR dt.from_agent_id IN (SELECT id FROM agent WHERE parent_agent_id = $1))
		AND dt.workspace_id = $2
		ORDER BY dt.created_at DESC LIMIT 10
	`, agentID, wsID)
	if dtErr == nil {
		defer dtRows.Close()
		for dtRows.Next() {
			var id, desc, status, fromName, toName string
			var fromAvatar, toAvatar *string
			var createdAt time.Time
			if err := dtRows.Scan(&id, &desc, &status, &createdAt, &fromName, &fromAvatar, &toName, &toAvatar); err != nil {
				continue
			}
			statusIcon := "⏳"
			if status == "completed" {
				statusIcon = "✓"
			} else if status == "failed" {
				statusIcon = "✗"
			}
			content := fmt.Sprintf("%s %s → %s: %s", statusIcon, fromName, toName, desc)
			if len(content) > 150 {
				content = content[:150] + "..."
			}
			events = append(events, ActivityEvent{
				ID:        id,
				Type:      "dispatch",
				AgentID:   agentID.String(),
				AgentName: fromName,
				AvatarURL: stringVal(fromAvatar),
				Content:   content,
				CreatedAt: createdAt,
			})
		}
	}

	// Sort by time, newest first
	sort.Slice(events, func(i, j int) bool {
		return events[i].CreatedAt.After(events[j].CreatedAt)
	})

	// Limit to 20
	if len(events) > 20 {
		events = events[:20]
	}

	writeJSON(w, http.StatusOK, events)
}
