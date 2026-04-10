-- Allow NULL workspace_id for built-in skills
ALTER TABLE skill ALTER COLUMN workspace_id DROP NOT NULL;

-- Drop the unique constraint that includes workspace_id (it won't work with NULLs)
ALTER TABLE skill DROP CONSTRAINT IF EXISTS skill_workspace_id_name_key;

-- Add a partial unique index for workspace skills and a separate one for builtins
CREATE UNIQUE INDEX IF NOT EXISTS uq_skill_workspace_name ON skill (workspace_id, name) WHERE workspace_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_skill_builtin_name ON skill (name) WHERE is_builtin = true AND workspace_id IS NULL;

-- Seed built-in skills
INSERT INTO skill (workspace_id, name, description, content, is_builtin, category) VALUES
(NULL, 'web-search', 'Web search capability', 'When asked to search the web, use your knowledge to provide the best answer. Note: direct web search API not yet connected.', true, 'research'),
(NULL, 'price-check', 'Crypto price checking', 'When asked about crypto prices, provide the most recent price information you have. Note: live price API not yet connected.', true, 'crypto'),
(NULL, 'portfolio-tracker', 'Portfolio tracking', 'Help the user track their crypto portfolio. Remember their holdings and report on performance.', true, 'crypto'),
(NULL, 'document-analyzer', 'Document analysis', 'When the user shares document content, analyze it thoroughly and extract key insights.', true, 'research'),
(NULL, 'morning-brief', 'Morning briefing', 'Generate a concise morning briefing covering crypto markets, key news, and any items from the user''s memory that need attention.', true, 'productivity')
ON CONFLICT DO NOTHING;
