package providers

import (
	"context"
	"errors"

	"github.com/mrderivatives/foundry-of-agents/server/pkg/bifrost"
)

type Anthropic struct {
	apiKey string
}

func NewAnthropic(apiKey string) *Anthropic {
	return &Anthropic{apiKey: apiKey}
}

func (a *Anthropic) Complete(_ context.Context, _ bifrost.CompletionRequest) (*bifrost.CompletionResponse, error) {
	return nil, errors.New("anthropic provider not implemented")
}

func (a *Anthropic) Stream(_ context.Context, _ bifrost.CompletionRequest, _ chan<- bifrost.StreamChunk) error {
	return errors.New("anthropic provider not implemented")
}

func (a *Anthropic) Embed(_ context.Context, _ []string) ([][]float32, error) {
	return nil, errors.New("anthropic provider does not support embedding")
}

func (a *Anthropic) SupportsEmbedding() bool {
	return false
}

func (a *Anthropic) Models() []bifrost.ModelInfo {
	return []bifrost.ModelInfo{
		{ID: "claude-sonnet-4-6", Provider: "anthropic", Tier: bifrost.TierFlagship},
		{ID: "claude-haiku-4-5-20251001", Provider: "anthropic", Tier: bifrost.TierFast},
	}
}
