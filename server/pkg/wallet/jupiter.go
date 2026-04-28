package wallet

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

// TokenMints maps human-readable token symbols to Solana mint addresses.
var TokenMints = map[string]string{
	"SOL":  "So11111111111111111111111111111111111111112",
	"USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
}

// JupiterQuote preserves the FULL Jupiter API response as raw JSON.
// The /swap endpoint requires ALL fields from the /quote response passed back
// verbatim — stripping fields causes deserialization errors (e.g., missing otherAmountThreshold).
type JupiterQuote struct {
	Raw json.RawMessage `json:"-"`

	// Parsed fields for display/policy evaluation only
	InputMint      string `json:"inputMint"`
	OutputMint     string `json:"outputMint"`
	InAmount       string `json:"inAmount"`
	OutAmount      string `json:"outAmount"`
	PriceImpactPct string `json:"priceImpactPct"`
}

// JupiterService interacts with the Jupiter aggregator API for swap quotes and transactions.
type JupiterService struct {
	client *http.Client
}

func NewJupiterService() *JupiterService {
	return &JupiterService{client: &http.Client{}}
}

// GetQuote fetches a swap quote from Jupiter.
func (js *JupiterService) GetQuote(ctx context.Context, inputMint, outputMint string, amountLamports uint64, slippageBps int) (*JupiterQuote, error) {
	u := fmt.Sprintf("https://lite-api.jup.ag/swap/v1/quote?inputMint=%s&outputMint=%s&amount=%d&slippageBps=%d",
		url.QueryEscape(inputMint), url.QueryEscape(outputMint), amountLamports, slippageBps)

	req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	resp, err := js.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("jupiter quote: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("jupiter quote error %d: %s", resp.StatusCode, string(b))
	}

	// Read the full response body to preserve all fields
	rawBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read quote body: %w", err)
	}

	var quote JupiterQuote
	if err := json.Unmarshal(rawBody, &quote); err != nil {
		return nil, fmt.Errorf("decode quote: %w", err)
	}
	// Store the raw JSON so /swap gets the complete response
	quote.Raw = json.RawMessage(rawBody)
	return &quote, nil
}

// GetSwapTransaction builds a serialized swap transaction from a quote.
func (js *JupiterService) GetSwapTransaction(ctx context.Context, quote *JupiterQuote, userPubkey string) (string, error) {
	// Use the raw quote response to ensure ALL Jupiter fields are passed back
	body, err := json.Marshal(map[string]interface{}{
		"quoteResponse":           json.RawMessage(quote.Raw),
		"userPublicKey":           userPubkey,
		"dynamicComputeUnitLimit": true,
		"dynamicSlippage":         true,
	})
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://lite-api.jup.ag/swap/v1/swap", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := js.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("jupiter swap: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("jupiter swap error %d: %s", resp.StatusCode, string(b))
	}

	var result struct {
		SwapTransaction string `json:"swapTransaction"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("decode swap: %w", err)
	}
	return result.SwapTransaction, nil
}
