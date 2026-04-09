package wallet

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Wallet struct {
	ID             uuid.UUID  `json:"id"`
	WorkspaceID    uuid.UUID  `json:"workspace_id"`
	AgentID        *uuid.UUID `json:"agent_id,omitempty"`
	OwnerID        uuid.UUID  `json:"owner_id"`
	Chain          string     `json:"chain"`
	PublicKey      string     `json:"public_key"`
	VaultKeyID     string     `json:"vault_key_id"`
	DerivationPath string     `json:"derivation_path,omitempty"`
	WalletType     string     `json:"wallet_type"`
	Status         string     `json:"status"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type WalletPolicy struct {
	ID                            uuid.UUID       `json:"id"`
	WalletID                      uuid.UUID       `json:"wallet_id"`
	DailyLimitUSD                 decimal.Decimal `json:"daily_limit_usd"`
	PerTxLimitUSD                 decimal.Decimal `json:"per_tx_limit_usd"`
	WeeklyLimitUSD                decimal.Decimal `json:"weekly_limit_usd"`
	MonthlyLimitUSD               decimal.Decimal `json:"monthly_limit_usd"`
	RequireConfirmationAboveUSD   decimal.Decimal `json:"require_confirmation_above_usd"`
	AllowedTokens                 []string        `json:"allowed_tokens"`
	BlockedTokens                 []string        `json:"blocked_tokens"`
	AllowedPrograms               []string        `json:"allowed_programs"`
	AutoFreezeOnAnomaly           bool            `json:"auto_freeze_on_anomaly"`
	AnomalyMaxTxPerHour           int             `json:"anomaly_max_tx_per_hour"`
	AnomalyMaxConsecutiveFailures int             `json:"anomaly_max_consecutive_failures"`
	AnomalyHourlySpendMultiplier  decimal.Decimal `json:"anomaly_hourly_spend_multiplier"`
	CreatedAt                     time.Time       `json:"created_at"`
	UpdatedAt                     time.Time       `json:"updated_at"`
}

type WalletTransaction struct {
	ID                uuid.UUID       `json:"id"`
	WalletID          uuid.UUID       `json:"wallet_id"`
	WorkspaceID       uuid.UUID       `json:"workspace_id"`
	AgentID           *uuid.UUID      `json:"agent_id,omitempty"`
	TaskID            *uuid.UUID      `json:"task_id,omitempty"`
	Chain             string          `json:"chain"`
	TxSignature       string          `json:"tx_signature,omitempty"`
	Action            string          `json:"action"`
	Status            string          `json:"status"`
	InputToken        string          `json:"input_token,omitempty"`
	InputAmount       string          `json:"input_amount,omitempty"`
	InputValueUSD     decimal.Decimal `json:"input_value_usd"`
	OutputToken       string          `json:"output_token,omitempty"`
	OutputAmount      string          `json:"output_amount,omitempty"`
	OutputValueUSD    decimal.Decimal `json:"output_value_usd"`
	SlippageTolerance decimal.Decimal `json:"slippage_tolerance"`
	BlockedReason     string          `json:"blocked_reason,omitempty"`
	FeeSol            decimal.Decimal `json:"fee_sol"`
	CreatedAt         time.Time       `json:"created_at"`
	ExecutedAt        *time.Time      `json:"executed_at,omitempty"`
}
