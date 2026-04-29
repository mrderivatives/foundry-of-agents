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
	r.Get("/debug/log", h.handleDebugLog)

	// Public auth routes
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/magic-link", h.handleMagicLink)
		r.Post("/verify", h.handleVerify)
		r.Post("/siws", h.handleSIWS)
		r.Post("/supabase-verify", h.handleSupabaseVerify)
		r.Post("/refresh", h.handleRefresh)
		r.Delete("/session", h.handleLogout)
	})

	// Public dataroom tracking routes (no auth required)
	r.Route("/api/dataroom", func(r chi.Router) {
		r.Post("/visit", h.handleDataroomVisit)
		r.Post("/event", h.handleDataroomEvent)
		r.Post("/gate", h.handleDataroomGate)
		r.Get("/stats", h.handleDataroomStats)
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
				r.Get("/activity", h.handleGetActivity)
				r.Get("/team", h.handleGetAgentTeam)
				r.Post("/team/add", h.handleAddTeamMember)
				r.Delete("/team/{subId}", h.handleRemoveTeamMember)
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
				r.Route("/wallet", func(r chi.Router) {
					r.Post("/", h.handleCreateWallet)
					r.Get("/", h.handleGetWallet)
					r.Get("/balance", h.handleWalletBalance)
					r.Get("/transactions", h.handleListWalletTransactions)
					r.Patch("/policy", h.handleUpdateWalletPolicy)
					r.Post("/freeze", h.handleFreezeWallet)
					r.Post("/unfreeze", h.handleUnfreezeWallet)
				})
			})
		})

		r.Route("/api/teams", func(r chi.Router) {
			r.Get("/", h.handleListTeams)
			r.Post("/", h.handleCreateTeam)
			r.Get("/{teamId}", h.handleGetTeam)
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
			r.Post("/upload", h.handleUploadDocument)
			r.Delete("/{docId}", h.handleDeleteDocument)
		})

		// Prompt Actions
		r.Route("/api/prompt-actions", func(r chi.Router) {
			r.Get("/", h.handleListPromptActions)
			r.Post("/{slug}/execute", h.handleExecutePromptAction)
			r.Post("/executions/{id}/complete", h.handleCompletePromptExecution)
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
