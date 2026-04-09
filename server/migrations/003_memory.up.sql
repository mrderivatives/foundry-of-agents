CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE memory_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agent(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    memory_type TEXT NOT NULL CHECK (memory_type IN ('episodic', 'semantic', 'entity', 'identity', 'user_context')),
    entity_name TEXT,
    entity_type TEXT,
    related_entities UUID[],
    superseded_by UUID REFERENCES memory_entry(id),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    importance_score FLOAT NOT NULL DEFAULT 0.5,
    access_count INT NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    source_type TEXT,
    source_id TEXT,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_memory_embedding ON memory_entry USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_memory_agent_created ON memory_entry(agent_id, created_at);
CREATE INDEX idx_memory_agent_type ON memory_entry(agent_id, memory_type);
CREATE INDEX idx_memory_entity ON memory_entry(agent_id, entity_name) WHERE memory_type = 'entity';
