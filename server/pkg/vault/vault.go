package vault

import (
	"context"
	"errors"
)

type Vault interface {
	Sign(ctx context.Context, keyID string, payload []byte) ([]byte, error)
	GenerateKey(ctx context.Context, derivationPath string) (keyID string, publicKey string, err error)
	RotateKey(ctx context.Context, keyID string) (newKeyID string, err error)
	RevokeKey(ctx context.Context, keyID string) error
}

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
