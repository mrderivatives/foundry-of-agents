-- pgvector extension - required for memory and document embeddings
-- This may fail if the extension is not available; handle gracefully
DO $$ 
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not available - vector columns will not work until installed';
END $$;
