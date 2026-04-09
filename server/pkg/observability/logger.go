package observability

import (
	"os"

	"github.com/rs/zerolog"
)

func NewLogger(service string) zerolog.Logger {
	return zerolog.New(os.Stdout).With().
		Timestamp().
		Str("service", service).
		Logger()
}

func WithWorkspace(logger zerolog.Logger, workspaceID string) zerolog.Logger {
	return logger.With().Str("workspace_id", workspaceID).Logger()
}

func WithAgent(logger zerolog.Logger, agentID string) zerolog.Logger {
	return logger.With().Str("agent_id", agentID).Logger()
}
