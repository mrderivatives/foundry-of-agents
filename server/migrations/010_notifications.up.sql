CREATE TABLE notification_preference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('telegram', 'email', 'discord', 'webhook', 'push')),
    channel_config JSONB NOT NULL,
    credential_vault_id TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    categories TEXT[] NOT NULL DEFAULT ARRAY['all'],
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, user_id, channel)
);

CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    user_id UUID,
    channel TEXT,
    category TEXT,
    title TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'suppressed')),
    error_message TEXT,
    source_type TEXT,
    source_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX idx_notification_log_workspace ON notification_log(workspace_id);
CREATE INDEX idx_notification_pref_user ON notification_preference(user_id);
