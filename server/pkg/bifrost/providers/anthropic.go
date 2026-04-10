package providers

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/shopspring/decimal"

	"github.com/mrderivatives/foundry-of-agents/server/pkg/bifrost"
)

const anthropicAPI = "https://api.anthropic.com/v1/messages"

type Anthropic struct {
	apiKey string
	client *http.Client
}

func NewAnthropic(apiKey string) *Anthropic {
	return &Anthropic{apiKey: apiKey, client: &http.Client{}}
}

type anthropicTool struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	InputSchema interface{} `json:"input_schema"`
}

type anthropicReq struct {
	Model     string        `json:"model"`
	MaxTokens int           `json:"max_tokens"`
	Messages  []anthropicMsg `json:"messages"`
	System    string        `json:"system,omitempty"`
	Stream    bool          `json:"stream,omitempty"`
	Tools     []anthropicTool `json:"tools,omitempty"`
}

type anthropicMsg struct {
	Role    string      `json:"role"`
	Content interface{} `json:"content"` // string or []contentBlock
}

type anthropicResp struct {
	ID      string `json:"id"`
	Model   string `json:"model"`
	Content []struct {
		Type  string          `json:"type"`
		Text  string          `json:"text,omitempty"`
		ID    string          `json:"id,omitempty"`
		Name  string          `json:"name,omitempty"`
		Input json.RawMessage `json:"input,omitempty"`
	} `json:"content"`
	StopReason string `json:"stop_reason"`
	Usage      struct {
		InputTokens  int `json:"input_tokens"`
		OutputTokens int `json:"output_tokens"`
	} `json:"usage"`
}

func (a *Anthropic) buildRequest(req bifrost.CompletionRequest) anthropicReq {
	ar := anthropicReq{
		Model:     req.Model,
		MaxTokens: req.MaxTokens,
	}
	if ar.MaxTokens == 0 {
		ar.MaxTokens = 4096
	}

	for _, t := range req.Tools {
		ar.Tools = append(ar.Tools, anthropicTool{
			Name:        t.Name,
			Description: t.Description,
			InputSchema: t.Parameters,
		})
	}

	for _, m := range req.Messages {
		if m.Role == "system" {
			ar.System = m.Content
			continue
		}
		if len(m.ContentParts) > 0 {
			var parts []map[string]interface{}
			for _, p := range m.ContentParts {
				part := map[string]interface{}{"type": p.Type}
				switch p.Type {
				case "text":
					part["text"] = p.Text
				case "tool_use":
					part["id"] = p.ID
					part["name"] = p.Name
					part["input"] = json.RawMessage(p.Input)
				case "tool_result":
					part["tool_use_id"] = p.ToolUseID
					part["content"] = p.Content
				}
				parts = append(parts, part)
			}
			ar.Messages = append(ar.Messages, anthropicMsg{Role: m.Role, Content: parts})
		} else {
			ar.Messages = append(ar.Messages, anthropicMsg{Role: m.Role, Content: m.Content})
		}
	}
	return ar
}

func (a *Anthropic) Complete(ctx context.Context, req bifrost.CompletionRequest) (*bifrost.CompletionResponse, error) {
	ar := a.buildRequest(req)
	ar.Stream = false

	body, err := json.Marshal(ar)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, anthropicAPI, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-api-key", a.apiKey)
	httpReq.Header.Set("anthropic-version", "2023-06-01")

	resp, err := a.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("anthropic request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("anthropic API error %d: %s", resp.StatusCode, string(respBody))
	}

	var ar2 anthropicResp
	if err := json.NewDecoder(resp.Body).Decode(&ar2); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	var toolCalls []bifrost.ToolCall
	var textContent string
	for _, block := range ar2.Content {
		switch block.Type {
		case "text":
			textContent = block.Text
		case "tool_use":
			toolCalls = append(toolCalls, bifrost.ToolCall{
				ID:    block.ID,
				Name:  block.Name,
				Input: block.Input,
			})
		}
	}

	return &bifrost.CompletionResponse{
		ID:      ar2.ID,
		Model:   ar2.Model,
		Content: textContent,
		Usage: bifrost.TokenUsage{
			InputTokens:  ar2.Usage.InputTokens,
			OutputTokens: ar2.Usage.OutputTokens,
			Cost:         decimal.Zero,
		},
		ToolCalls:  toolCalls,
		StopReason: ar2.StopReason,
	}, nil
}

func (a *Anthropic) Stream(ctx context.Context, req bifrost.CompletionRequest, ch chan<- bifrost.StreamChunk) error {
	defer close(ch)

	ar := a.buildRequest(req)
	ar.Stream = true

	body, err := json.Marshal(ar)
	if err != nil {
		return fmt.Errorf("marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, anthropicAPI, bytes.NewReader(body))
	if err != nil {
		return err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-api-key", a.apiKey)
	httpReq.Header.Set("anthropic-version", "2023-06-01")

	resp, err := a.client.Do(httpReq)
	if err != nil {
		return fmt.Errorf("anthropic request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("anthropic API error %d: %s", resp.StatusCode, string(respBody))
	}

	scanner := bufio.NewScanner(resp.Body)
	var msgID string
	var eventType string
	var inputTokens, outputTokens int

	for scanner.Scan() {
		line := scanner.Text()

		if strings.HasPrefix(line, "event: ") {
			eventType = strings.TrimPrefix(line, "event: ")
			continue
		}

		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		data := strings.TrimPrefix(line, "data: ")

		switch eventType {
		case "message_start":
			var evt struct {
				Message struct {
					ID    string `json:"id"`
					Usage struct {
						InputTokens int `json:"input_tokens"`
					} `json:"usage"`
				} `json:"message"`
			}
			if json.Unmarshal([]byte(data), &evt) == nil {
				msgID = evt.Message.ID
				inputTokens = evt.Message.Usage.InputTokens
			}

		case "content_block_delta":
			var evt struct {
				Delta struct {
					Type string `json:"type"`
					Text string `json:"text"`
				} `json:"delta"`
			}
			if json.Unmarshal([]byte(data), &evt) == nil && evt.Delta.Text != "" {
				ch <- bifrost.StreamChunk{
					ID:    msgID,
					Delta: evt.Delta.Text,
				}
			}

		case "message_delta":
			var evt struct {
				Usage struct {
					OutputTokens int `json:"output_tokens"`
				} `json:"usage"`
			}
			if json.Unmarshal([]byte(data), &evt) == nil {
				outputTokens = evt.Usage.OutputTokens
			}

		case "message_stop":
			ch <- bifrost.StreamChunk{
				ID:   msgID,
				Done: true,
				Usage: &bifrost.TokenUsage{
					InputTokens:  inputTokens,
					OutputTokens: outputTokens,
					Cost:         decimal.Zero,
				},
			}
			return nil
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("reading SSE stream: %w", err)
	}

	return nil
}

func (a *Anthropic) Embed(_ context.Context, _ []string) ([][]float32, error) {
	return nil, errors.New("anthropic provider does not support embedding")
}

func (a *Anthropic) SupportsEmbedding() bool {
	return false
}

func (a *Anthropic) Models() []bifrost.ModelInfo {
	return []bifrost.ModelInfo{
		{ID: "claude-sonnet-4-6", Provider: "anthropic", Tier: bifrost.TierMid},
		{ID: "claude-haiku-4-5-20251001", Provider: "anthropic", Tier: bifrost.TierFast},
		{ID: "claude-opus-4-6", Provider: "anthropic", Tier: bifrost.TierFlagship},
	}
}
