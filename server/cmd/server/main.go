package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/mrderivatives/foundry-of-agents/server/internal/handler"
	"github.com/mrderivatives/foundry-of-agents/server/internal/realtime"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/bifrost"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/bifrost/providers"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/db"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/queue"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = zerolog.New(os.Stdout).With().Timestamp().Caller().Logger()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:3000"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-change-me"
	}

	// Database
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://foundry:foundry@localhost:5432/foundry?sslmode=disable"
	}

	ctx := context.Background()
	pool, err := db.NewPool(ctx, dbURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer pool.Close()
	log.Info().Msg("database connected")

	// Redis / queue (best-effort — not fatal if unavailable)
	var queueClient *queue.Client
	redisURL := os.Getenv("REDIS_URL")
	if redisURL != "" {
		var err error
		queueClient, err = queue.NewClient(redisURL)
		if err != nil {
			log.Warn().Err(err).Msg("failed to connect to redis, queue disabled")
		} else {
			defer queueClient.Close()
		}
	}

	// Bifrost LLM router
	bifrostRouter := bifrost.NewRouter()
	anthropicKey := os.Getenv("ANTHROPIC_API_KEY")
	if anthropicKey != "" {
		bifrostRouter.Register("anthropic", providers.NewAnthropic(anthropicKey))
		log.Info().Msg("anthropic provider registered")
	}

	hub := realtime.NewHub()
	go hub.Run()

	h := handler.NewHandler(handler.Deps{
		DB:               pool,
		Hub:              hub,
		Router:           bifrostRouter,
		Queue:            queueClient,
		JWTSecret:        []byte(jwtSecret),
		Logger:           log.Logger,
		TelegramBotToken: os.Getenv("TELEGRAM_BOT_TOKEN"),
		ResendAPIKey:     os.Getenv("RESEND_API_KEY"),
	})

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{corsOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	handler.MountRoutes(r, h)

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	sigCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Info().Str("port", port).Msg("server starting")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("server failed")
		}
	}()

	<-sigCtx.Done()
	log.Info().Msg("shutting down server")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatal().Err(err).Msg("server shutdown failed")
	}

	log.Info().Msg("server stopped")
}
// forced rebuild 1775775058
// rebuild 1775780802
