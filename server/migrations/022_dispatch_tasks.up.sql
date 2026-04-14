CREATE TABLE IF NOT EXISTS dispatch_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    chat_session_id UUID REFERENCES chat_session(id),
    from_agent_id UUID NOT NULL REFERENCES agent(id),
    to_agent_id UUID NOT NULL REFERENCES agent(id),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    result TEXT,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dispatch_session ON dispatch_task(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_to ON dispatch_task(to_agent_id);
