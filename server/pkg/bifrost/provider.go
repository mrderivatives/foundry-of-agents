package bifrost

import "context"

type Provider interface {
	Complete(ctx context.Context, req CompletionRequest) (*CompletionResponse, error)
	Stream(ctx context.Context, req CompletionRequest, ch chan<- StreamChunk) error
	Embed(ctx context.Context, input []string) ([][]float32, error)
	SupportsEmbedding() bool
	Models() []ModelInfo
}
