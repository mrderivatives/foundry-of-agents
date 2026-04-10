package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/channels"
)

type notifPrefRow struct {
	ID            uuid.UUID       `json:"id"`
	WorkspaceID   uuid.UUID       `json:"workspace_id"`
	UserID        uuid.UUID       `json:"user_id"`
	Channel       string          `json:"channel"`
	ChannelConfig json.RawMessage `json:"channel_config"`
	Enabled       bool            `json:"enabled"`
	Categories    []string        `json:"categories"`
	CreatedAt     time.Time       `json:"created_at"`
}

// POST /api/notifications/preferences
func (h *Handler) handleSaveNotifPref(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())

	var body struct {
		Channel string          `json:"channel"`
		Config  json.RawMessage `json:"config"`
		Enabled *bool           `json:"enabled"`
	}
	if err := readJSON(r, &body); err != nil || body.Channel == "" {
		errJSON(w, http.StatusBadRequest, "channel is required")
		return
	}

	enabled := true
	if body.Enabled != nil {
		enabled = *body.Enabled
	}
	if body.Config == nil {
		body.Config = json.RawMessage(`{}`)
	}

	var pref notifPrefRow
	err := h.DB.QueryRow(r.Context(),
		`INSERT INTO notification_preference (workspace_id, user_id, channel, channel_config, enabled)
		 VALUES ($1, $2, $3, $4, $5)
		 ON CONFLICT (workspace_id, user_id, channel)
		 DO UPDATE SET channel_config = EXCLUDED.channel_config, enabled = EXCLUDED.enabled
		 RETURNING id, workspace_id, user_id, channel, channel_config, enabled, categories, created_at`,
		wsID, userID, body.Channel, body.Config, enabled).Scan(
		&pref.ID, &pref.WorkspaceID, &pref.UserID, &pref.Channel,
		&pref.ChannelConfig, &pref.Enabled, &pref.Categories, &pref.CreatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to upsert notification preference")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusOK, pref)
}

// GET /api/notifications/preferences
func (h *Handler) handleListNotifPrefs(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, workspace_id, user_id, channel, channel_config, enabled, categories, created_at
		 FROM notification_preference
		 WHERE workspace_id = $1 AND user_id = $2
		 ORDER BY created_at DESC`, wsID, userID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list notification preferences")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	prefs := []notifPrefRow{}
	for rows.Next() {
		var p notifPrefRow
		if err := rows.Scan(&p.ID, &p.WorkspaceID, &p.UserID, &p.Channel,
			&p.ChannelConfig, &p.Enabled, &p.Categories, &p.CreatedAt); err != nil {
			h.Logger.Error().Err(err).Msg("failed to scan notification preference")
			continue
		}
		prefs = append(prefs, p)
	}

	writeJSON(w, http.StatusOK, prefs)
}

// POST /api/notifications/test
func (h *Handler) handleTestNotification(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())

	var body struct {
		Channel string `json:"channel"`
		Message string `json:"message"`
	}
	if err := readJSON(r, &body); err != nil || body.Channel == "" {
		errJSON(w, http.StatusBadRequest, "channel is required")
		return
	}
	if body.Message == "" {
		body.Message = "Test notification from Foundry of Agents"
	}

	ctx := r.Context()

	switch body.Channel {
	case "telegram":
		if h.TelegramBotToken == "" {
			errJSON(w, http.StatusServiceUnavailable, "telegram bot token not configured")
			return
		}

		// Look up user's telegram chat_id from preferences
		var configRaw json.RawMessage
		err := h.DB.QueryRow(ctx,
			`SELECT channel_config FROM notification_preference
			 WHERE workspace_id = $1 AND user_id = $2 AND channel = 'telegram'`,
			wsID, userID).Scan(&configRaw)
		if err != nil {
			errJSON(w, http.StatusNotFound, "no telegram preference configured")
			return
		}

		var config struct {
			ChatID string `json:"chat_id"`
		}
		if err := json.Unmarshal(configRaw, &config); err != nil || config.ChatID == "" {
			errJSON(w, http.StatusBadRequest, "telegram chat_id not set in preferences")
			return
		}

		driver := channels.NewTelegramDriver(h.TelegramBotToken)
		if err := driver.Send(ctx, config.ChatID, body.Message); err != nil {
			h.Logger.Error().Err(err).Msg("telegram test notification failed")
			errJSON(w, http.StatusBadGateway, "failed to send telegram message: "+err.Error())
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"status": "sent"})

	default:
		errJSON(w, http.StatusBadRequest, "unsupported channel: "+body.Channel)
	}
}
