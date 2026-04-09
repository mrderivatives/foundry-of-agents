package bifrost

import "github.com/shopspring/decimal"

type ModelTier string

const (
	TierFlagship ModelTier = "flagship"
	TierMid      ModelTier = "mid"
	TierFast     ModelTier = "fast"
	TierEmbed    ModelTier = "embed"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ToolDef struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Parameters  interface{} `json:"parameters"`
}

type CompletionRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Tools       []ToolDef `json:"tools,omitempty"`
	MaxTokens   int       `json:"max_tokens,omitempty"`
	Temperature float64   `json:"temperature,omitempty"`
	Stream      bool      `json:"stream,omitempty"`
}

type TokenUsage struct {
	InputTokens  int             `json:"input_tokens"`
	OutputTokens int             `json:"output_tokens"`
	Cost         decimal.Decimal `json:"cost"`
}

type CompletionResponse struct {
	ID      string     `json:"id"`
	Model   string     `json:"model"`
	Content string     `json:"content"`
	Usage   TokenUsage `json:"usage"`
}

type StreamChunk struct {
	ID    string `json:"id"`
	Delta string `json:"delta"`
	Done  bool   `json:"done"`
}

type ModelInfo struct {
	ID       string    `json:"id"`
	Provider string    `json:"provider"`
	Tier     ModelTier `json:"tier"`
}
