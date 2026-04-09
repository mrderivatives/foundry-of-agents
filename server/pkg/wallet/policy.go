package wallet

import "context"

type PolicyEngine interface {
	Evaluate(ctx context.Context, tx WalletTransaction, policy WalletPolicy) (approved bool, reason string, err error)
}

type StubPolicyEngine struct{}

func NewStubPolicyEngine() *StubPolicyEngine {
	return &StubPolicyEngine{}
}

func (s *StubPolicyEngine) Evaluate(_ context.Context, _ WalletTransaction, _ WalletPolicy) (bool, string, error) {
	return false, "policy engine not implemented", nil
}
