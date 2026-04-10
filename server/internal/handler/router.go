package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func MountRoutes(r chi.Router, h *Handler) {
	r.Get("/health", h.handleHealth)

	// Public auth routes
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/magic-link", h.handleMagicLink)
		r.Post("/verify", h.handleVerify)
		r.Post("/siws", h.handleSIWS)
		r.Post("/supabase-verify", h.handleSupabaseVerify)
		r.Post("/refresh", h.handleRefresh)
		r.Delete("/session", h.handleLogout)
	})

	// Protected routes — require JWT
	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(h.JWTSecret))

		r.Get("/api/auth/me", h.handleMe)

		r.Route("/api/agents", func(r chi.Router) {
			r.Get("/", h.handleListAgents)
			r.Post("/", h.handleCreateAgent)
			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", h.handleGetAgent)
				r.Patch("/", h.handleUpdateAgent)
				r.Delete("/", h.handleDeleteAgent)
				r.Route("/sessions", func(r chi.Router) {
					r.Get("/", h.handleListSessions)
					r.Post("/", h.handleCreateSession)
					r.Route("/{sessionId}", func(r chi.Router) {
						r.Get("/messages", h.handleListMessages)
						r.Post("/messages", h.handleSendMessage)
					})
				})
				r.Route("/memory", func(r chi.Router) {
					r.Get("/", h.handleListMemory)
					r.Get("/debug", h.handleMemoryDebug)
					r.Post("/", h.handleCreateMemory)
					r.Delete("/{memId}", h.handleDeleteMemory)
				})
				r.Route("/cron-jobs", func(r chi.Router) {
					r.Get("/", h.handleListCronJobs)
					r.Post("/", h.handleCreateCronJob)
				})
				r.Route("/skills", func(r chi.Router) {
					r.Get("/", h.handleListAgentSkills)
					r.Post("/", h.handleAssignSkill)
					r.Delete("/{skillId}", h.handleUnassignSkill)
				})
			})
		})

		r.Route("/api/notifications", func(r chi.Router) {
			r.Get("/preferences", h.handleListNotifPrefs)
			r.Post("/preferences", h.handleSaveNotifPref)
			r.Post("/test", h.handleTestNotification)
		})

		r.Route("/api/cron-jobs", func(r chi.Router) {
			r.Route("/{cronId}", func(r chi.Router) {
				r.Patch("/", h.handleUpdateCronJob)
				r.Delete("/", h.handleDeleteCronJob)
			})
		})

		r.Route("/api/skills", func(r chi.Router) {
			r.Get("/", h.handleListSkills)
			r.Post("/", h.handleCreateSkill)
			r.Get("/{skillId}", h.handleGetSkill)
		})

		r.Route("/api/documents", func(r chi.Router) {
			r.Get("/", h.handleListDocuments)
			r.Post("/", h.handleCreateDocument)
			r.Delete("/{docId}", h.handleDeleteDocument)
		})
	})

	r.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Error().Err(err).Msg("websocket upgrade failed")
			return
		}
		token := r.URL.Query().Get("token")
		h.Hub.HandleConnectionWithToken(conn, token, h.JWTSecret)
	})
}
