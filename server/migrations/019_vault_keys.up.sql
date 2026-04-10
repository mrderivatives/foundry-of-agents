CREATE TABLE IF NOT EXISTS vault_key (
    id TEXT PRIMARY KEY,
    public_key TEXT NOT NULL,
    encrypted_private_key TEXT NOT NULL,
    derivation_path TEXT,
    chain TEXT NOT NULL DEFAULT 'solana',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE wallet_transaction ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_tx_idempotency
    ON wallet_transaction (idempotency_key) WHERE idempotency_key IS NOT NULL;
