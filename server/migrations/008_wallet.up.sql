CREATE TABLE wallet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agent(id) ON DELETE SET NULL,
    owner_id UUID NOT NULL REFERENCES "user"(id),
    chain TEXT NOT NULL DEFAULT 'solana',
    public_key TEXT NOT NULL,
    vault_key_id TEXT NOT NULL,
    derivation_path TEXT,
    vault_key_id_history TEXT[],
    wallet_type TEXT NOT NULL CHECK (wallet_type IN ('custodial', 'delegated', 'watch_only')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, public_key)
);

CREATE TABLE wallet_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallet(id) ON DELETE CASCADE,
    daily_limit_usd NUMERIC(20, 8),
    per_tx_limit_usd NUMERIC(20, 8),
    weekly_limit_usd NUMERIC(20, 8),
    monthly_limit_usd NUMERIC(20, 8),
    require_confirmation_above_usd NUMERIC(20, 8),
    allowed_tokens TEXT[],
    blocked_tokens TEXT[],
    allowed_programs TEXT[],
    active_hours_start TIME,
    active_hours_end TIME,
    active_hours_timezone TEXT NOT NULL DEFAULT 'UTC',
    active_hours_spans_midnight BOOLEAN NOT NULL DEFAULT FALSE,
    auto_freeze_on_anomaly BOOLEAN NOT NULL DEFAULT TRUE,
    anomaly_max_tx_per_hour INT NOT NULL DEFAULT 10,
    anomaly_max_consecutive_failures INT NOT NULL DEFAULT 3,
    anomaly_hourly_spend_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 2.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wallet_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallet(id),
    workspace_id UUID NOT NULL,
    agent_id UUID REFERENCES agent(id),
    task_id UUID REFERENCES task(id),
    chain TEXT NOT NULL DEFAULT 'solana',
    tx_signature TEXT,
    action TEXT NOT NULL CHECK (action IN ('swap', 'transfer', 'stake', 'unstake', 'claim', 'approve', 'other')),
    status TEXT NOT NULL CHECK (status IN ('proposed', 'pending_confirmation', 'approved', 'executed', 'failed', 'blocked', 'reverted', 'expired')),
    input_token TEXT,
    input_amount TEXT,
    input_value_usd NUMERIC(20, 8),
    output_token TEXT,
    output_amount TEXT,
    output_value_usd NUMERIC(20, 8),
    slippage_tolerance NUMERIC(6, 4) NOT NULL DEFAULT 0.01,
    policy_check JSONB,
    blocked_reason TEXT,
    fee_sol NUMERIC(20, 8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    executed_at TIMESTAMPTZ,
    confirmation_expires_at TIMESTAMPTZ
);

CREATE INDEX idx_wallet_tx_wallet ON wallet_transaction(wallet_id);
CREATE INDEX idx_wallet_tx_workspace ON wallet_transaction(workspace_id);
CREATE INDEX idx_wallet_workspace ON wallet(workspace_id);
