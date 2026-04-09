package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/hibiken/asynq"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/mrderivatives/foundry-of-agents/server/pkg/queue"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = zerolog.New(os.Stdout).With().Timestamp().Caller().Logger()

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	redisOpt, err := asynq.ParseRedisURI(redisURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to parse redis URL")
	}

	srv := asynq.NewServer(redisOpt, asynq.Config{
		Concurrency: 10,
		Queues: map[string]int{
			"critical": 10,
			"high":     6,
			"normal":   3,
			"low":      1,
		},
	})

	mux := asynq.NewServeMux()
	mux.HandleFunc(queue.TypeTaskExecute, handleTaskExecute)
	mux.HandleFunc(queue.TypeCronFire, handleCronFire)
	mux.HandleFunc(queue.TypeHeartbeatFire, handleHeartbeatFire)
	mux.HandleFunc(queue.TypeNotificationSend, handleNotificationSend)
	mux.HandleFunc(queue.TypeDocumentProcess, handleDocumentProcess)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Info().Msg("worker starting")
		if err := srv.Run(mux); err != nil {
			log.Fatal().Err(err).Msg("worker failed")
		}
	}()

	<-ctx.Done()
	log.Info().Msg("shutting down worker")
	srv.Shutdown()
	log.Info().Msg("worker stopped")
}

func handleTaskExecute(_ context.Context, t *asynq.Task) error {
	log.Info().Str("type", t.Type()).Msg("processing task")
	return nil
}

func handleCronFire(_ context.Context, t *asynq.Task) error {
	log.Info().Str("type", t.Type()).Msg("processing cron")
	return nil
}

func handleHeartbeatFire(_ context.Context, t *asynq.Task) error {
	log.Info().Str("type", t.Type()).Msg("processing heartbeat")
	return nil
}

func handleNotificationSend(_ context.Context, t *asynq.Task) error {
	log.Info().Str("type", t.Type()).Msg("processing notification")
	return nil
}

func handleDocumentProcess(_ context.Context, t *asynq.Task) error {
	log.Info().Str("type", t.Type()).Msg("processing document")
	return nil
}
