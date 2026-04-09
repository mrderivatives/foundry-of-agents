CREATE TABLE workspace_quota (
    workspace_id UUID PRIMARY KEY REFERENCES workspace(id) ON DELETE CASCADE,
    max_agents INT,
    max_memory_entries BIGINT,
    max_storage_bytes BIGINT,
    max_monthly_llm_cost_usd NUMERIC(20, 8),
    max_wallet_tx_per_day INT,
    max_cron_jobs INT
);

CREATE TABLE workspace_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    llm_input_tokens BIGINT NOT NULL DEFAULT 0,
    llm_output_tokens BIGINT NOT NULL DEFAULT 0,
    llm_cost_usd NUMERIC(20, 8) NOT NULL DEFAULT 0,
    storage_bytes BIGINT NOT NULL DEFAULT 0,
    notification_count BIGINT NOT NULL DEFAULT 0,
    wallet_tx_count BIGINT NOT NULL DEFAULT 0,
    task_count BIGINT NOT NULL DEFAULT 0,
    UNIQUE (workspace_id, period_start)
);
