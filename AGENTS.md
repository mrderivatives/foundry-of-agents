# Coding Discipline — Foundry of Agents

1. **NUMERIC(20,8) for all financial values.** Never use floating-point types (float64, FLOAT, DOUBLE) for money, costs, or token amounts. Use `shopspring/decimal` in Go and `NUMERIC(20,8)` in PostgreSQL.

2. **sqlc for type-safe database queries.** All SQL queries go through sqlc-generated code. No hand-written `rows.Scan()` chains.

3. **Chi router with `r.Route()` pattern.** All HTTP routes use Chi's nested `r.Route()` grouping. No flat route registration.

4. **asynq for the job queue.** All background work (task execution, cron, heartbeat, notifications, document processing) runs through asynq with prioritized queues.

5. **zerolog for structured logging.** Every log line must include `workspace_id` and `agent_id` where available. No `fmt.Println` or `log.Println`.

6. **gorilla/websocket for the WebSocket hub.** Real-time events use workspace-scoped rooms with connect/disconnect/broadcast semantics.

7. **Valid PostgreSQL 17 + pgvector syntax.** Every migration must parse cleanly against PG17. Use `VECTOR(1536)` for embeddings.

8. **FOR UPDATE SKIP LOCKED for task claiming.** When workers claim tasks from the queue, use `SELECT ... FOR UPDATE SKIP LOCKED` to prevent contention.

9. **HNSW indexes for pgvector.** Always use HNSW (not IVFFlat) for vector similarity indexes: `USING hnsw (embedding vector_cosine_ops)`.

10. **No hallucinated packages.** Every Go import must reference a real, published module. Verify before adding.
