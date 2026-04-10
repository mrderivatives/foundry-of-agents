package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
)

type walletRow struct {
	ID             uuid.UUID  `json:"id"`
	WorkspaceID    uuid.UUID  `json:"workspace_id"`
	AgentID        *uuid.UUID `json:"agent_id,omitempty"`
	OwnerID        uuid.UUID  `json:"owner_id"`
	Chain          string     `json:"chain"`
	PublicKey      string     `json:"public_key"`
	Status         string     `json:"status"`
	WalletType     string     `json:"wallet_type"`
	CreatedAt      time.Time  `json:"created_at"`
}

type walletPolicyRow struct {
	ID                  uuid.UUID       `json:"id"`
	WalletID            uuid.UUID       `json:"wallet_id"`
	DailyLimitUSD       decimal.Decimal `json:"daily_limit_usd"`
	PerTxLimitUSD       decimal.Decimal `json:"per_tx_limit_usd"`
	AllowedTokens       []string        `json:"allowed_tokens"`
	AutoFreezeOnAnomaly bool            `json:"auto_freeze_on_anomaly"`
	AnomalyMaxTxPerHour int             `json:"anomaly_max_tx_per_hour"`
}

type walletTxRow struct {
	ID            uuid.UUID       `json:"id"`
	WalletID      uuid.UUID       `json:"wallet_id"`
	Action        string          `json:"action"`
	Status        string          `json:"status"`
	InputToken    *string         `json:"input_token,omitempty"`
	InputAmount   *string         `json:"input_amount,omitempty"`
	InputValueUSD decimal.Decimal `json:"input_value_usd"`
	OutputToken   *string         `json:"output_token,omitempty"`
	OutputAmount  *string         `json:"output_amount,omitempty"`
	BlockedReason *string         `json:"blocked_reason,omitempty"`
	CreatedAt     time.Time       `json:"created_at"`
}

// POST /api/agents/{id}/wallet — create wallet for agent
func (h *Handler) handleCreateWallet(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	userID, _ := auth.GetUserID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	ctx := r.Context()

	// Check if agent already has a wallet
	var existing int
	h.DB.QueryRow(ctx, `SELECT COUNT(*) FROM wallet WHERE agent_id = $1 AND workspace_id = $2`, agentID, wsID).Scan(&existing)
	if existing > 0 {
		errJSON(w, http.StatusConflict, "agent already has a wallet")
		return
	}

	// Generate key via vault
	derivationPath := fmt.Sprintf("m/44'/501'/0'/0'/%s", agentID.String()[:8])
	keyID, publicKey, err := h.Vault.GenerateKey(ctx, derivationPath)
	if err != nil {
		h.Logger.Error().Err(err).Msg("vault key generation failed")
		errJSON(w, http.StatusInternalServerError, "failed to generate wallet key")
		return
	}

	// Create wallet
	var wal walletRow
	err = h.DB.QueryRow(ctx,
		`INSERT INTO wallet (workspace_id, agent_id, owner_id, chain, public_key, vault_key_id, derivation_path, wallet_type, status)
		 VALUES ($1, $2, $3, 'solana', $4, $5, $6, 'custodial', 'active')
		 RETURNING id, workspace_id, agent_id, owner_id, chain, public_key, status, wallet_type, created_at`,
		wsID, agentID, userID, publicKey, keyID, derivationPath).Scan(
		&wal.ID, &wal.WorkspaceID, &wal.AgentID, &wal.OwnerID, &wal.Chain, &wal.PublicKey, &wal.Status, &wal.WalletType, &wal.CreatedAt)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to create wallet")
		errJSON(w, http.StatusInternalServerError, "failed to create wallet")
		return
	}

	// Create default policy
	h.DB.Exec(ctx,
		`INSERT INTO wallet_policy (wallet_id, daily_limit_usd, per_tx_limit_usd, allowed_tokens, auto_freeze_on_anomaly, anomaly_max_tx_per_hour)
		 VALUES ($1, 100, 50, ARRAY['SOL','USDC'], true, 10)`,
		wal.ID)

	writeJSON(w, http.StatusCreated, wal)
}

// GET /api/agents/{id}/wallet — get agent's wallet
func (h *Handler) handleGetWallet(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	ctx := r.Context()

	var wal walletRow
	err = h.DB.QueryRow(ctx,
		`SELECT id, workspace_id, agent_id, owner_id, chain, public_key, status, wallet_type, created_at
		 FROM wallet WHERE agent_id = $1 AND workspace_id = $2`,
		agentID, wsID).Scan(
		&wal.ID, &wal.WorkspaceID, &wal.AgentID, &wal.OwnerID, &wal.Chain, &wal.PublicKey, &wal.Status, &wal.WalletType, &wal.CreatedAt)
	if err != nil {
		errJSON(w, http.StatusNotFound, "no wallet found for this agent")
		return
	}

	// Load policy
	var policy walletPolicyRow
	h.DB.QueryRow(ctx,
		`SELECT id, wallet_id, daily_limit_usd, per_tx_limit_usd, allowed_tokens, auto_freeze_on_anomaly, anomaly_max_tx_per_hour
		 FROM wallet_policy WHERE wallet_id = $1`, wal.ID).Scan(
		&policy.ID, &policy.WalletID, &policy.DailyLimitUSD, &policy.PerTxLimitUSD,
		&policy.AllowedTokens, &policy.AutoFreezeOnAnomaly, &policy.AnomalyMaxTxPerHour)

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"wallet": wal,
		"policy": policy,
	})
}

// GET /api/agents/{id}/wallet/transactions — transaction history
func (h *Handler) handleListWalletTransactions(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	ctx := r.Context()

	rows, err := h.DB.Query(ctx,
		`SELECT wt.id, wt.wallet_id, wt.action, wt.status, wt.input_token, wt.input_amount, wt.input_value_usd,
		        wt.output_token, wt.output_amount, wt.blocked_reason, wt.created_at
		 FROM wallet_transaction wt
		 JOIN wallet w ON w.id = wt.wallet_id
		 WHERE w.agent_id = $1 AND wt.workspace_id = $2
		 ORDER BY wt.created_at DESC LIMIT 100`,
		agentID, wsID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to list wallet transactions")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	defer rows.Close()

	txs := []walletTxRow{}
	for rows.Next() {
		var tx walletTxRow
		if err := rows.Scan(&tx.ID, &tx.WalletID, &tx.Action, &tx.Status,
			&tx.InputToken, &tx.InputAmount, &tx.InputValueUSD,
			&tx.OutputToken, &tx.OutputAmount, &tx.BlockedReason, &tx.CreatedAt); err != nil {
			continue
		}
		txs = append(txs, tx)
	}

	writeJSON(w, http.StatusOK, txs)
}

// PATCH /api/agents/{id}/wallet/policy — update policy
func (h *Handler) handleUpdateWalletPolicy(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	ctx := r.Context()

	var body struct {
		DailyLimitUSD       *decimal.Decimal `json:"daily_limit_usd"`
		PerTxLimitUSD       *decimal.Decimal `json:"per_tx_limit_usd"`
		AllowedTokens       *[]string        `json:"allowed_tokens"`
		AutoFreezeOnAnomaly *bool            `json:"auto_freeze_on_anomaly"`
		AnomalyMaxTxPerHour *int             `json:"anomaly_max_tx_per_hour"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Get wallet ID
	var walletID uuid.UUID
	err = h.DB.QueryRow(ctx, `SELECT id FROM wallet WHERE agent_id = $1 AND workspace_id = $2`, agentID, wsID).Scan(&walletID)
	if err != nil {
		errJSON(w, http.StatusNotFound, "no wallet found")
		return
	}

	if body.DailyLimitUSD != nil {
		h.DB.Exec(ctx, `UPDATE wallet_policy SET daily_limit_usd = $1, updated_at = NOW() WHERE wallet_id = $2`, body.DailyLimitUSD, walletID)
	}
	if body.PerTxLimitUSD != nil {
		h.DB.Exec(ctx, `UPDATE wallet_policy SET per_tx_limit_usd = $1, updated_at = NOW() WHERE wallet_id = $2`, body.PerTxLimitUSD, walletID)
	}
	if body.AllowedTokens != nil {
		h.DB.Exec(ctx, `UPDATE wallet_policy SET allowed_tokens = $1, updated_at = NOW() WHERE wallet_id = $2`, *body.AllowedTokens, walletID)
	}
	if body.AutoFreezeOnAnomaly != nil {
		h.DB.Exec(ctx, `UPDATE wallet_policy SET auto_freeze_on_anomaly = $1, updated_at = NOW() WHERE wallet_id = $2`, *body.AutoFreezeOnAnomaly, walletID)
	}
	if body.AnomalyMaxTxPerHour != nil {
		h.DB.Exec(ctx, `UPDATE wallet_policy SET anomaly_max_tx_per_hour = $1, updated_at = NOW() WHERE wallet_id = $2`, *body.AnomalyMaxTxPerHour, walletID)
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "updated"})
}

// POST /api/agents/{id}/wallet/freeze
func (h *Handler) handleFreezeWallet(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	_, err = h.DB.Exec(r.Context(),
		`UPDATE wallet SET status = 'frozen', updated_at = NOW() WHERE agent_id = $1 AND workspace_id = $2`,
		agentID, wsID)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "failed to freeze wallet")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "frozen"})
}

// POST /api/agents/{id}/wallet/unfreeze
func (h *Handler) handleUnfreezeWallet(w http.ResponseWriter, r *http.Request) {
	wsID, _ := auth.GetWorkspaceID(r.Context())
	agentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid agent id")
		return
	}

	_, err = h.DB.Exec(r.Context(),
		`UPDATE wallet SET status = 'active', updated_at = NOW() WHERE agent_id = $1 AND workspace_id = $2`,
		agentID, wsID)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "failed to unfreeze wallet")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "active"})
}

// checksToString formats policy checks for display.
func checksToString(checks []policyCheckJSON) string {
	result := ""
	for _, c := range checks {
		status := "PASS"
		if !c.Passed {
			status = "FAIL"
		}
		result += fmt.Sprintf("[%s] %s: %s\n", status, c.Rule, c.Details)
	}
	return result
}

type policyCheckJSON struct {
	Rule    string `json:"rule"`
	Passed  bool   `json:"passed"`
	Details string `json:"details"`
}

// unused import guard
var _ = json.Marshal
