# Foundry of Agents

SwarmForge v3 — Crypto-native AI Agent Operating System.

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/mrderivatives/foundry-of-agents.git
cd foundry-of-agents

# 2. Start infrastructure
docker-compose up -d

# 3. Set up the Go server
cd server
make setup
make migrate-up
make dev

# 4. Set up the frontend (in another terminal)
cd apps/web
pnpm install
pnpm dev
```

## Architecture

```
foundry-of-agents/
├── server/              # Go backend (Chi + asynq + pgx)
│   ├── cmd/             # Entry points (server, worker, migrate)
│   ├── internal/        # Private application code
│   ├── pkg/             # Shared libraries
│   └── migrations/      # PostgreSQL migrations
├── apps/web/            # Next.js 16 frontend
├── packages/tsconfig/   # Shared TypeScript config
└── docker-compose.yml   # PostgreSQL + Redis + MinIO
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgres://foundry:foundry@localhost:5432/foundry?sslmode=disable` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `PORT` | `8080` | Server port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |

## Stack

- **Backend:** Go 1.24, Chi, pgx/v5, asynq, zerolog, gorilla/websocket
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind v4, Zustand
- **Database:** PostgreSQL 17 + pgvector
- **Queue:** Redis 7 + asynq
- **Storage:** MinIO (S3-compatible)

