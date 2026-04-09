CREATE TABLE task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agent(id),
    runtime_id UUID REFERENCES agent_runtime(id),
    source_type TEXT NOT NULL CHECK (source_type IN ('user_message', 'cron', 'heartbeat', 'webhook', 'agent_dispatch', 'notification')),
    source_id TEXT,
    prompt TEXT,
    context JSONB,
    session_id TEXT,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'dispatched', 'working', 'completed', 'failed', 'cancelled')),
    priority INT NOT NULL DEFAULT 40,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    result_storage_key TEXT,
    result_summary JSONB,
    output_channel TEXT,
    output_target TEXT,
    parent_task_id UUID REFERENCES task(id),
    expected_children INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_pending ON task(runtime_id, priority DESC, created_at ASC)
    WHERE status IN ('queued', 'dispatched');
CREATE INDEX idx_task_agent_status ON task(agent_id, status);
CREATE INDEX idx_task_stuck ON task(status, updated_at)
    WHERE status IN ('dispatched', 'working');
