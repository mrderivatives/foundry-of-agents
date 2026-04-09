-- Fulltext search index for keyword-based memory retrieval
CREATE INDEX idx_memory_content_fts ON memory_entry USING gin (to_tsvector('english', content));
