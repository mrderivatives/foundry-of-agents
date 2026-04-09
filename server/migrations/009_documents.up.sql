CREATE TABLE document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES "user"(id),
    filename TEXT,
    mime_type TEXT,
    size_bytes BIGINT,
    storage_key TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
    page_count INT,
    total_chunks INT,
    all_agents_access BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE document_agent_access (
    document_id UUID NOT NULL REFERENCES document(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agent(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, agent_id)
);

CREATE TABLE document_chunk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES document(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    chunk_index INT NOT NULL,
    page_number INT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doc_chunk_embedding ON document_chunk USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_doc_chunk_doc ON document_chunk(document_id);
CREATE INDEX idx_document_workspace ON document(workspace_id);
