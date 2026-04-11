ALTER TABLE agent ADD COLUMN IF NOT EXISTS parent_agent_id UUID REFERENCES agent(id);
CREATE INDEX IF NOT EXISTS idx_agent_parent ON agent(parent_agent_id) WHERE parent_agent_id IS NOT NULL;
