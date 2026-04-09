package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"

	"github.com/mrderivatives/foundry-of-agents/server/internal/realtime"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func MountRoutes(r chi.Router, hub *realtime.Hub) {
	r.Get("/health", handleHealth)

	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/magic-link", handleMagicLink)
		r.Post("/verify", handleVerify)
		r.Post("/siws", handleSIWS)
		r.Post("/refresh", handleRefresh)
		r.Delete("/session", handleLogout)
	})

	r.Route("/api/agents", func(r chi.Router) {
		r.Get("/", handleListAgents)
		r.Post("/", handleCreateAgent)
		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", handleGetAgent)
			r.Patch("/", handleUpdateAgent)
			r.Delete("/", handleDeleteAgent)
			r.Route("/sessions", func(r chi.Router) {
				r.Get("/", handleListSessions)
				r.Post("/", handleCreateSession)
				r.Route("/{sessionId}", func(r chi.Router) {
					r.Get("/messages", handleListMessages)
					r.Post("/messages", handleSendMessage)
				})
			})
		})
	})

	r.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Error().Err(err).Msg("websocket upgrade failed")
			return
		}
		hub.HandleConnection(conn)
	})
}
