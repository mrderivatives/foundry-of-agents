package wallet

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
)

// PolicyCheck records the result of a single policy rule evaluation.
type PolicyCheck struct {
	Rule    string `json:"rule"`
	Passed  bool   `json:"passed"`
	Details string `json:"details"`
}

// TxProposal describes a proposed transaction for policy evaluation.
type TxProposal struct {
	WalletID    uuid.UUID
	Action      string // "swap", "transfer"
	InputToken  string
	OutputToken string
	AmountUSD   decimal.Decimal
	InputAmount string
}

// PolicyEngine evaluates transaction proposals against wallet policies.
// All evaluation is deterministic Go — NEVER LLM-evaluated.
type PolicyEngine interface {
	EvaluateProposal(ctx context.Context, walletID uuid.UUID, proposal TxProposal) (approved bool, checks []PolicyCheck, err error)
}

// RealPolicyEngine loads policy from DB and evaluates proposals deterministically.
type RealPolicyEngine struct {
	pool *pgxpool.Pool
}

func NewPolicyEngine(pool *pgxpool.Pool) *RealPolicyEngine {
	return &RealPolicyEngine{pool: pool}
}

func (e *RealPolicyEngine) EvaluateProposal(ctx context.Context, walletID uuid.UUID, proposal TxProposal) (bool, []PolicyCheck, error) {
	// Load policy
	var policy WalletPolicy
	err := e.pool.QueryRow(ctx,
		`SELECT id, daily_limit_usd, per_tx_limit_usd, allowed_tokens,
		        auto_freeze_on_anomaly, anomaly_max_tx_per_hour
		 FROM wallet_policy WHERE wallet_id = $1`, walletID).Scan(
		&policy.ID, &policy.DailyLimitUSD, &policy.PerTxLimitUSD,
		&policy.AllowedTokens, &policy.AutoFreezeOnAnomaly, &policy.AnomalyMaxTxPerHour)
	if err != nil {
		return false, nil, fmt.Errorf("load policy: %w", err)
	}

	checks := []PolicyCheck{}
	allPassed := true

	// 1. Wallet active?
	var walletStatus string
	e.pool.QueryRow(ctx, `SELECT status FROM wallet WHERE id = $1`, walletID).Scan(&walletStatus)
	if walletStatus != "active" {
		checks = append(checks, PolicyCheck{"wallet_active", false, "Wallet is " + walletStatus})
		return false, checks, nil
	}
	checks = append(checks, PolicyCheck{"wallet_active", true, "Wallet is active"})

	// 2. Per-tx limit
	if !policy.PerTxLimitUSD.IsZero() && proposal.AmountUSD.GreaterThan(policy.PerTxLimitUSD) {
		checks = append(checks, PolicyCheck{"per_tx_limit", false,
			fmt.Sprintf("$%s exceeds per-tx limit of $%s", proposal.AmountUSD, policy.PerTxLimitUSD)})
		allPassed = false
	} else {
		checks = append(checks, PolicyCheck{"per_tx_limit", true, "Within per-tx limit"})
	}

	// 3. Daily limit
	var todaySpend decimal.Decimal
	e.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(input_value_usd), 0) FROM wallet_transaction
		 WHERE wallet_id = $1 AND status = 'executed'
		 AND created_at >= CURRENT_DATE`, walletID).Scan(&todaySpend)

	if !policy.DailyLimitUSD.IsZero() && todaySpend.Add(proposal.AmountUSD).GreaterThan(policy.DailyLimitUSD) {
		checks = append(checks, PolicyCheck{"daily_limit", false,
			fmt.Sprintf("$%s + today's $%s exceeds daily limit of $%s", proposal.AmountUSD, todaySpend, policy.DailyLimitUSD)})
		allPassed = false
	} else {
		checks = append(checks, PolicyCheck{"daily_limit", true,
			fmt.Sprintf("$%s of $%s daily limit used", todaySpend, policy.DailyLimitUSD)})
	}

	// 4. Token whitelist
	if len(policy.AllowedTokens) > 0 {
		inputOk := contains(policy.AllowedTokens, proposal.InputToken)
		outputOk := contains(policy.AllowedTokens, proposal.OutputToken)
		if !inputOk || !outputOk {
			checks = append(checks, PolicyCheck{"token_whitelist", false,
				fmt.Sprintf("Token not in whitelist: input=%s output=%s", proposal.InputToken, proposal.OutputToken)})
			allPassed = false
		} else {
			checks = append(checks, PolicyCheck{"token_whitelist", true, "Tokens approved"})
		}
	}

	// 5. Anomaly: tx count this hour
	var txCountHour int
	e.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM wallet_transaction
		 WHERE wallet_id = $1 AND created_at >= NOW() - INTERVAL '1 hour'`, walletID).Scan(&txCountHour)
	if policy.AnomalyMaxTxPerHour > 0 && txCountHour >= policy.AnomalyMaxTxPerHour {
		checks = append(checks, PolicyCheck{"anomaly_tx_rate", false,
			fmt.Sprintf("%d tx this hour, max %d", txCountHour, policy.AnomalyMaxTxPerHour)})
		allPassed = false
		// Auto-freeze if enabled
		if policy.AutoFreezeOnAnomaly {
			e.pool.Exec(ctx, `UPDATE wallet SET status = 'frozen' WHERE id = $1`, walletID)
		}
	} else {
		checks = append(checks, PolicyCheck{"anomaly_tx_rate", true, "Normal tx rate"})
	}

	return allPassed, checks, nil
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// StubPolicyEngine always denies — used when no DB pool is available.
type StubPolicyEngine struct{}

func NewStubPolicyEngine() *StubPolicyEngine {
	return &StubPolicyEngine{}
}

func (s *StubPolicyEngine) EvaluateProposal(_ context.Context, _ uuid.UUID, _ TxProposal) (bool, []PolicyCheck, error) {
	return false, []PolicyCheck{{Rule: "stub", Passed: false, Details: "policy engine not implemented"}}, nil
}
