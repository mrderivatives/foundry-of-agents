-- pgvector - attempt to install, skip if unavailable
-- Vector columns will use TEXT fallback until pgvector is installed
DO $$
BEGIN
    EXECUTE 'CREATE EXTENSION IF NOT EXISTS vector';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector not available: %', SQLERRM;
END $$;
