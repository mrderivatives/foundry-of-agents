CREATE TABLE cron_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agent(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES "user"(id),
    name TEXT,
    description TEXT,
    cron_expression TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    prompt TEXT NOT NULL,
    output_channel TEXT,
    output_target TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_run_status TEXT CHECK (last_run_status IN ('completed', 'failed')),
    consecutive_failures INT NOT NULL DEFAULT 0,
    max_cost_per_run NUMERIC(20, 8),
    timeout_seconds INT NOT NULL DEFAULT 300,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cron_job_skill (
    cron_job_id UUID NOT NULL REFERENCES cron_job(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skill(id) ON DELETE RESTRICT,
    PRIMARY KEY (cron_job_id, skill_id)
);

CREATE INDEX idx_cron_next_run ON cron_job(next_run_at ASC) WHERE enabled = TRUE;
CREATE INDEX idx_cron_workspace ON cron_job(workspace_id);
