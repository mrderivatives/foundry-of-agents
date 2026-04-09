CREATE TABLE agent_runtime (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    daemon_id TEXT,
    name TEXT NOT NULL,
    runtime_mode TEXT NOT NULL CHECK (runtime_mode IN ('local', 'cloud', 'hybrid')),
    provider TEXT NOT NULL CHECK (provider IN ('claude', 'codex', 'openclaw', 'opencode', 'bifrost')),
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'degraded')),
    device_info TEXT,
    metadata JSONB,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, daemon_id, provider)
);

CREATE TABLE agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    runtime_id UUID REFERENCES agent_runtime(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    avatar_url TEXT,
    model TEXT,
    fallback_models TEXT[],
    max_concurrent_tasks INT NOT NULL DEFAULT 1,
    heartbeat_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    heartbeat_interval_ms INT NOT NULL DEFAULT 1800000,
    heartbeat_instructions TEXT,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('idle', 'working', 'blocked', 'error', 'offline')),
    visibility TEXT NOT NULL DEFAULT 'workspace' CHECK (visibility IN ('workspace', 'private')),
    owner_id UUID NOT NULL REFERENCES "user"(id),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_workspace ON agent(workspace_id);
CREATE INDEX idx_agent_runtime ON agent(runtime_id);
CREATE INDEX idx_agent_owner ON agent(owner_id);
