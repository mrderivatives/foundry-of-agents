CREATE TABLE agent_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    instructions TEXT,
    default_model TEXT,
    default_skills TEXT[],
    experience_config JSONB NOT NULL DEFAULT '{}'::JSONB,
    icon TEXT,
    is_builtin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_template_workspace ON agent_template(workspace_id);
CREATE INDEX idx_template_builtin ON agent_template(is_builtin) WHERE is_builtin = TRUE;
