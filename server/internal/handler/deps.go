package handler

import (
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"

	"github.com/mrderivatives/foundry-of-agents/server/internal/realtime"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/bifrost"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/queue"
)

type Deps struct {
	DB               *pgxpool.Pool
	Hub              *realtime.Hub
	Router           *bifrost.Router
	Queue            *queue.Client
	JWTSecret        []byte
	Logger           zerolog.Logger
	TelegramBotToken string
	ResendAPIKey     string
}

type Handler struct {
	Deps
}

func NewHandler(d Deps) *Handler {
	return &Handler{Deps: d}
}

// writeJSON writes a JSON response with the given status code.
func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// readJSON decodes the request body into v.
func readJSON(r *http.Request, v interface{}) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(v)
}

// errJSON writes a JSON error response.
func errJSON(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
