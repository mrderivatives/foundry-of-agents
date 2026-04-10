package vault

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/ed25519"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mr-tron/base58"
)

// Vault defines the interface for key management operations.
// Private keys MUST never appear in logs, error messages, or LLM context.
type Vault interface {
	Sign(ctx context.Context, keyID string, payload []byte) ([]byte, error)
	GenerateKey(ctx context.Context, derivationPath string) (keyID string, publicKey string, err error)
	RotateKey(ctx context.Context, keyID string) (newKeyID string, err error)
	RevokeKey(ctx context.Context, keyID string) error
}

// PGVault implements Vault backed by PostgreSQL with AES-256-GCM envelope encryption.
type PGVault struct {
	pool      *pgxpool.Pool
	masterKey []byte // 32-byte AES key
}

// NewPGVault creates a vault that encrypts Ed25519 private keys with AES-256-GCM
// and stores them in PostgreSQL. masterKeyHex must be a 64-character hex string (32 bytes).
func NewPGVault(pool *pgxpool.Pool, masterKeyHex string) (*PGVault, error) {
	key, err := hex.DecodeString(masterKeyHex)
	if err != nil || len(key) != 32 {
		return nil, fmt.Errorf("VAULT_MASTER_KEY must be 64-char hex (32 bytes)")
	}
	return &PGVault{pool: pool, masterKey: key}, nil
}

// GenerateKey creates an Ed25519 keypair, encrypts the seed with AES-256-GCM,
// and stores it in vault_key. Returns the key ID and base58-encoded public key.
func (v *PGVault) GenerateKey(ctx context.Context, derivationPath string) (keyID string, publicKeyB58 string, err error) {
	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return "", "", fmt.Errorf("keygen: %w", err)
	}

	// Encrypt only the 32-byte seed (not the full 64-byte private key)
	encrypted, err := v.encrypt(priv.Seed())
	if err != nil {
		return "", "", fmt.Errorf("encrypt: %w", err)
	}

	kid := uuid.New().String()
	_, err = v.pool.Exec(ctx,
		`INSERT INTO vault_key (id, public_key, encrypted_private_key, derivation_path, chain)
		 VALUES ($1, $2, $3, $4, 'solana')`,
		kid, base58.Encode(pub), hex.EncodeToString(encrypted), derivationPath)
	if err != nil {
		return "", "", fmt.Errorf("store key: %w", err)
	}

	// Zero private key material from memory
	for i := range priv {
		priv[i] = 0
	}

	return kid, base58.Encode(pub), nil
}

// Sign loads the encrypted seed from the DB, decrypts it, signs the payload,
// and zeros all key material before returning.
func (v *PGVault) Sign(ctx context.Context, keyID string, payload []byte) ([]byte, error) {
	var encryptedHex string
	err := v.pool.QueryRow(ctx,
		`SELECT encrypted_private_key FROM vault_key WHERE id = $1`, keyID).Scan(&encryptedHex)
	if err != nil {
		return nil, fmt.Errorf("load key: %w", err)
	}

	encrypted, err := hex.DecodeString(encryptedHex)
	if err != nil {
		return nil, fmt.Errorf("decode key: %w", err)
	}

	seed, err := v.decrypt(encrypted)
	if err != nil {
		return nil, fmt.Errorf("decrypt: %w", err)
	}

	priv := ed25519.NewKeyFromSeed(seed)
	sig := ed25519.Sign(priv, payload)

	// Zero key material
	for i := range seed {
		seed[i] = 0
	}
	for i := range priv {
		priv[i] = 0
	}

	return sig, nil
}

func (v *PGVault) RotateKey(_ context.Context, _ string) (string, error) {
	return "", fmt.Errorf("key rotation not yet implemented")
}

func (v *PGVault) RevokeKey(ctx context.Context, keyID string) error {
	_, err := v.pool.Exec(ctx, `DELETE FROM vault_key WHERE id = $1`, keyID)
	return err
}

func (v *PGVault) encrypt(plaintext []byte) ([]byte, error) {
	block, err := aes.NewCipher(v.masterKey)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}
	return gcm.Seal(nonce, nonce, plaintext, nil), nil
}

func (v *PGVault) decrypt(ciphertext []byte) ([]byte, error) {
	block, err := aes.NewCipher(v.masterKey)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}
	return gcm.Open(nil, ciphertext[:nonceSize], ciphertext[nonceSize:], nil)
}

// StubVault is a no-op vault for environments without VAULT_MASTER_KEY.
type StubVault struct{}

func NewStubVault() *StubVault {
	return &StubVault{}
}

func (s *StubVault) Sign(_ context.Context, _ string, _ []byte) ([]byte, error) {
	return nil, errors.New("stub vault: not implemented")
}

func (s *StubVault) GenerateKey(_ context.Context, _ string) (string, string, error) {
	return "", "", errors.New("stub vault: not implemented")
}

func (s *StubVault) RotateKey(_ context.Context, _ string) (string, error) {
	return "", errors.New("stub vault: not implemented")
}

func (s *StubVault) RevokeKey(_ context.Context, _ string) error {
	return errors.New("stub vault: not implemented")
}
