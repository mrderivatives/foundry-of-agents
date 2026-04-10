package bifrost

import (
	"encoding/json"

	"github.com/shopspring/decimal"
)

type ModelTier string

const (
	TierFlagship ModelTier = "flagship"
	TierMid      ModelTier = "mid"
	TierFast     ModelTier = "fast"
	TierEmbed    ModelTier = "embed"
)

type Message struct {
	Role         string        `json:"role"`
	Content      string        `json:"content,omitempty"`
	ContentParts []ContentPart `json:"content_parts,omitempty"`
}

type ContentPart struct {
	Type      string          `json:"type"`
	Text      string          `json:"text,omitempty"`
	ID        string          `json:"id,omitempty"`
	Name      string          `json:"name,omitempty"`
	Input     json.RawMessage `json:"input,omitempty"`
	ToolUseID string          `json:"tool_use_id,omitempty"`
	Content   interface{}     `json:"content,omitempty"`
}

type ToolDef struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Parameters  interface{} `json:"parameters"`
}

type ToolCall struct {
	ID    string          `json:"id"`
	Name  string          `json:"name"`
	Input json.RawMessage `json:"input"`
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
	ID         string     `json:"id"`
	Model      string     `json:"model"`
	Content    string     `json:"content"`
	Usage      TokenUsage `json:"usage"`
	ToolCalls  []ToolCall `json:"tool_calls,omitempty"`
	StopReason string     `json:"stop_reason,omitempty"`
}

type StreamChunk struct {
	ID    string      `json:"id"`
	Delta string      `json:"delta"`
	Done  bool        `json:"done"`
	Usage *TokenUsage `json:"usage,omitempty"`
}

type ModelInfo struct {
	ID       string    `json:"id"`
	Provider string    `json:"provider"`
	Tier     ModelTier `json:"tier"`
}
