package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/mrderivatives/foundry-of-agents/server/pkg/bifrost"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/bifrost/providers"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/channels"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/db"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/queue"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/tools"
)

type workerDeps struct {
	pool           *pgxpool.Pool
	router         *bifrost.Router
	telegram       *channels.TelegramDriver
	queueClient    *queue.Client
	perplexityKey  string
}

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = zerolog.New(os.Stdout).With().Timestamp().Caller().Logger()

	ctx := context.Background()

	// DB
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal().Msg("DATABASE_URL required")
	}
	pool, err := db.NewPool(ctx, dbURL)
	if err != nil {
		log.Fatal().Err(err).Msg("db connect failed")
	}
	defer pool.Close()

	// Bifrost
	router := bifrost.NewRouter()
	if key := os.Getenv("ANTHROPIC_API_KEY"); key != "" {
		router.Register("anthropic", providers.NewAnthropic(key))
	}

	// Telegram
	var tg *channels.TelegramDriver
	if token := os.Getenv("TELEGRAM_BOT_TOKEN"); token != "" {
		tg = channels.NewTelegramDriver(token)
	}

	perplexityKey := os.Getenv("PERPLEXITY_API_KEY")

	deps := &workerDeps{pool: pool, router: router, telegram: tg, perplexityKey: perplexityKey}

	// Redis
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}
	log.Info().Str("redis_url", redisURL).Msg("connecting to redis")
	redisOpt, err := asynq.ParseRedisURI(redisURL)
	if err != nil {
		log.Fatal().Err(err).Str("redis_url", redisURL).Msg("redis parse failed")
	}

	// Queue client for enqueueing tasks from handlers
	qClient, err := queue.NewClient(redisURL)
	if err != nil {
		log.Fatal().Err(err).Msg("queue client init failed")
	}
	defer qClient.Close()
	deps.queueClient = qClient

	// asynq server (task processor)
	srv := asynq.NewServer(redisOpt, asynq.Config{
		Concurrency: 5,
		Queues:      map[string]int{"critical": 10, "high": 6, "normal": 3, "low": 1},
	})

	mux := asynq.NewServeMux()
	mux.HandleFunc(queue.TypeCronFire, deps.handleCronFire)
	mux.HandleFunc(queue.TypeTaskExecute, deps.handleTaskExecute)
	mux.HandleFunc(queue.TypeHeartbeatFire, deps.handleHeartbeatFire)
	mux.HandleFunc(queue.TypeNotificationSend, deps.handleNotificationSend)
	mux.HandleFunc(queue.TypeDocumentProcess, deps.handleDocumentProcess)

	// asynq scheduler (cron registrar)
	scheduler := asynq.NewScheduler(redisOpt, &asynq.SchedulerOpts{
		Location: time.UTC,
	})

	// Load cron jobs from DB and register
	log.Info().Msg("loading cron jobs from database")
	deps.registerCronJobs(ctx, scheduler)

	sigCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Info().Msg("worker starting")
		if err := srv.Run(mux); err != nil {
			log.Fatal().Err(err).Msg("worker failed")
		}
	}()

	go func() {
		log.Info().Msg("scheduler starting")
		if err := scheduler.Run(); err != nil {
			log.Fatal().Err(err).Msg("scheduler failed")
		}
	}()

	<-sigCtx.Done()
	log.Info().Msg("shutting down")
	srv.Shutdown()
	scheduler.Shutdown()
}

func (d *workerDeps) registerCronJobs(ctx context.Context, s *asynq.Scheduler) {
	rows, err := d.pool.Query(ctx,
		`SELECT id, workspace_id, agent_id, cron_expression FROM cron_job WHERE enabled = true`)
	if err != nil {
		log.Error().Err(err).Msg("failed to load cron jobs")
		return
	}
	defer rows.Close()

	count := 0
	for rows.Next() {
		var id, wsID, agentID, cronExpr string
		if err := rows.Scan(&id, &wsID, &agentID, &cronExpr); err != nil {
			log.Error().Err(err).Msg("scan cron job failed")
			continue
		}
		payload, _ := json.Marshal(queue.CronFirePayload{
			CronJobID: id, WorkspaceID: wsID,
		})
		_, err := s.Register(cronExpr, asynq.NewTask(queue.TypeCronFire, payload),
			asynq.Queue("normal"))
		if err != nil {
			log.Error().Err(err).Str("cron_id", id).Str("expr", cronExpr).Msg("failed to register cron")
		} else {
			count++
			log.Info().Str("cron_id", id).Str("expr", cronExpr).Msg("registered cron job")
		}
	}
	log.Info().Int("count", count).Msg("cron jobs registered")
}

func (d *workerDeps) handleCronFire(ctx context.Context, t *asynq.Task) error {
	var payload queue.CronFirePayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return fmt.Errorf("unmarshal: %w", err)
	}

	log.Info().Str("cron_id", payload.CronJobID).Msg("executing cron job")

	// Load cron job
	var agentID, prompt, outputChannel, outputTarget, agentName string
	var agentInstructions *string
	var agentModel *string
	err := d.pool.QueryRow(ctx,
		`SELECT c.agent_id, c.prompt, c.output_channel, c.output_target,
				a.name, a.instructions, a.model
		 FROM cron_job c JOIN agent a ON a.id = c.agent_id
		 WHERE c.id = $1`, payload.CronJobID).Scan(
		&agentID, &prompt, &outputChannel, &outputTarget,
		&agentName, &agentInstructions, &agentModel)
	if err != nil {
		return fmt.Errorf("load cron job: %w", err)
	}

	// Build system prompt
	var systemPrompt strings.Builder
	systemPrompt.WriteString(fmt.Sprintf("You are %s.", agentName))
	if agentInstructions != nil && *agentInstructions != "" {
		systemPrompt.WriteString(" " + *agentInstructions)
	}

	// Load agent's memories (recent semantic)
	memRows, err := d.pool.Query(ctx,
		`SELECT content FROM memory_entry WHERE agent_id = $1
		 AND memory_type IN ('semantic', 'identity', 'user_context')
		 ORDER BY created_at DESC LIMIT 10`, agentID)
	if err == nil {
		defer memRows.Close()
		var memories []string
		for memRows.Next() {
			var c string
			if memRows.Scan(&c) == nil {
				memories = append(memories, "- "+c)
			}
		}
		if len(memories) > 0 {
			systemPrompt.WriteString("\n\n## Your Memory\n" + strings.Join(memories, "\n"))
		}
	}

	// Determine model
	model := "claude-sonnet-4-6"
	if agentModel != nil && *agentModel != "" {
		m := *agentModel
		if i := strings.LastIndex(m, "/"); i >= 0 {
			m = m[i+1:]
		}
		model = m
	}

	// Build tools list
	var availableTools []bifrost.ToolDef
	if d.perplexityKey != "" {
		availableTools = append(availableTools, bifrost.ToolDef{
			Name:        "web_search",
			Description: "Search the web for current information. Use for prices, news, market data, or anything requiring up-to-date info.",
			Parameters: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"query": map[string]interface{}{"type": "string", "description": "Search query"},
				},
				"required": []string{"query"},
			},
		})
	}

	// Call Bifrost
	messages := []bifrost.Message{
		{Role: "system", Content: systemPrompt.String()},
		{Role: "user", Content: prompt},
	}
	resp, err := d.router.Route(ctx, bifrost.CompletionRequest{
		Model:     model,
		Messages:  messages,
		Tools:     availableTools,
		MaxTokens: 1024,
	})
	if err != nil {
		log.Error().Err(err).Str("cron_id", payload.CronJobID).Msg("bifrost call failed")
		d.pool.Exec(ctx, `UPDATE cron_job SET last_run_at = NOW(), last_run_status = 'failed',
			consecutive_failures = consecutive_failures + 1 WHERE id = $1`, payload.CronJobID)
		return err
	}

	// Handle tool calls (one round)
	if len(resp.ToolCalls) > 0 {
		log.Info().Int("tool_calls", len(resp.ToolCalls)).Str("cron_id", payload.CronJobID).Msg("cron tool use detected")

		assistantParts := []bifrost.ContentPart{}
		if resp.Content != "" {
			assistantParts = append(assistantParts, bifrost.ContentPart{Type: "text", Text: resp.Content})
		}
		for _, tc := range resp.ToolCalls {
			assistantParts = append(assistantParts, bifrost.ContentPart{Type: "tool_use", ID: tc.ID, Name: tc.Name, Input: tc.Input})
		}
		messages = append(messages, bifrost.Message{Role: "assistant", ContentParts: assistantParts})

		toolResultParts := []bifrost.ContentPart{}
		for _, tc := range resp.ToolCalls {
			var result string
			switch tc.Name {
			case "web_search":
				var input struct {
					Query string `json:"query"`
				}
				json.Unmarshal(tc.Input, &input)
				if input.Query != "" {
					log.Info().Str("query", input.Query).Msg("cron executing web search")
					result, err = tools.WebSearch(ctx, d.perplexityKey, input.Query)
					if err != nil {
						log.Error().Err(err).Msg("cron web search failed")
						result = "Search failed: " + err.Error()
					}
				} else {
					result = "No query provided"
				}
			default:
				result = "Unknown tool: " + tc.Name
			}
			toolResultParts = append(toolResultParts, bifrost.ContentPart{Type: "tool_result", ToolUseID: tc.ID, Content: result})
		}
		messages = append(messages, bifrost.Message{Role: "user", ContentParts: toolResultParts})

		resp, err = d.router.Route(ctx, bifrost.CompletionRequest{
			Model: model, Messages: messages, MaxTokens: 1024,
		})
		if err != nil {
			log.Error().Err(err).Str("cron_id", payload.CronJobID).Msg("bifrost second call failed")
			d.pool.Exec(ctx, `UPDATE cron_job SET last_run_at = NOW(), last_run_status = 'failed',
				consecutive_failures = consecutive_failures + 1 WHERE id = $1`, payload.CronJobID)
			return err
		}
	}

	result := resp.Content
	log.Info().Str("cron_id", payload.CronJobID).Int("len", len(result)).Msg("cron response generated")

	// Store as episodic memory
	_, memErr := d.pool.Exec(ctx,
		`INSERT INTO memory_entry (agent_id, workspace_id, content, memory_type, source_type, source_id)
		 VALUES ($1, $2, $3, 'episodic', 'cron', $4)`,
		agentID, payload.WorkspaceID, result, payload.CronJobID)
	if memErr != nil {
		log.Error().Err(memErr).Msg("failed to store cron episodic memory")
	}

	// Deliver via output channel
	if outputChannel == "telegram" && d.telegram != nil && outputTarget != "" {
		header := fmt.Sprintf("*%s*\n\n", agentName)
		if err := d.telegram.Send(ctx, outputTarget, header+result); err != nil {
			log.Error().Err(err).Msg("telegram delivery failed")
		} else {
			log.Info().Str("target", outputTarget).Msg("cron result delivered via telegram")
		}
	}

	// Enqueue notification task
	if d.queueClient != nil {
		notifPayload, _ := json.Marshal(queue.NotificationSendPayload{
			WorkspaceID: payload.WorkspaceID,
			Channel:     outputChannel,
			Content:     result,
			AgentName:   agentName,
		})
		if _, err := d.queueClient.Enqueue(queue.TypeNotificationSend, notifPayload); err != nil {
			log.Error().Err(err).Msg("failed to enqueue notification")
		}
	}

	// Update cron job
	d.pool.Exec(ctx, `UPDATE cron_job SET last_run_at = NOW(), last_run_status = 'completed',
		consecutive_failures = 0 WHERE id = $1`, payload.CronJobID)

	return nil
}

func (d *workerDeps) handleTaskExecute(_ context.Context, t *asynq.Task) error {
	log.Info().Str("type", t.Type()).Msg("processing task")
	return nil
}

func (d *workerDeps) handleHeartbeatFire(_ context.Context, t *asynq.Task) error {
	log.Info().Str("type", t.Type()).Msg("processing heartbeat")
	return nil
}

func (d *workerDeps) handleNotificationSend(ctx context.Context, t *asynq.Task) error {
	var payload struct {
		WorkspaceID string `json:"workspace_id"`
		UserID      string `json:"user_id"`
		Channel     string `json:"channel"`
		Content     string `json:"content"`
		AgentName   string `json:"agent_name"`
	}
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return err
	}

	log.Info().Str("channel", payload.Channel).Msg("sending notification")

	switch payload.Channel {
	case "telegram":
		if d.telegram == nil {
			log.Warn().Msg("telegram not configured")
			return nil
		}
		// Load chat_id from notification_preference
		var configRaw json.RawMessage
		err := d.pool.QueryRow(ctx,
			`SELECT channel_config FROM notification_preference
			 WHERE workspace_id = $1 AND user_id = $2 AND channel = 'telegram'`,
			payload.WorkspaceID, payload.UserID).Scan(&configRaw)
		if err != nil {
			log.Warn().Err(err).Msg("no telegram preference, skipping")
			return nil
		}
		var config struct {
			ChatID string `json:"chat_id"`
		}
		json.Unmarshal(configRaw, &config)
		if config.ChatID == "" {
			return nil
		}

		msg := payload.Content
		if payload.AgentName != "" {
			msg = fmt.Sprintf("*%s*\n\n%s", payload.AgentName, msg)
		}
		return d.telegram.Send(ctx, config.ChatID, msg)
	}
	return nil
}

func (d *workerDeps) handleDocumentProcess(_ context.Context, t *asynq.Task) error {
	log.Info().Str("type", t.Type()).Msg("processing document")
	return nil
}
