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

type anthropicReq struct {
	Model     string              `json:"model"`
	MaxTokens int                 `json:"max_tokens"`
	Messages  []anthropicMessage  `json:"messages"`
	System    string              `json:"system,omitempty"`
	Stream    bool                `json:"stream,omitempty"`
}

type anthropicMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type anthropicResp struct {
	ID      string `json:"id"`
	Model   string `json:"model"`
	Content []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"content"`
	Usage struct {
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

	for _, m := range req.Messages {
		if m.Role == "system" {
			ar.System = m.Content
			continue
		}
		ar.Messages = append(ar.Messages, anthropicMessage{Role: m.Role, Content: m.Content})
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

	content := ""
	if len(ar2.Content) > 0 {
		content = ar2.Content[0].Text
	}

	return &bifrost.CompletionResponse{
		ID:      ar2.ID,
		Model:   ar2.Model,
		Content: content,
		Usage: bifrost.TokenUsage{
			InputTokens:  ar2.Usage.InputTokens,
			OutputTokens: ar2.Usage.OutputTokens,
			Cost:         decimal.Zero,
		},
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
