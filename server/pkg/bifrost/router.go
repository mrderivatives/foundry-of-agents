package bifrost

import (
	"context"
	"fmt"
	"sync"
)

type Router struct {
	mu        sync.RWMutex
	providers map[string]Provider
	modelMap  map[string]string // model ID -> provider name
}

func NewRouter() *Router {
	return &Router{
		providers: make(map[string]Provider),
		modelMap:  make(map[string]string),
	}
}

func (r *Router) Register(name string, p Provider) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.providers[name] = p
	for _, m := range p.Models() {
		r.modelMap[m.ID] = name
	}
}

func (r *Router) Route(ctx context.Context, req CompletionRequest) (*CompletionResponse, error) {
	r.mu.RLock()
	providerName, ok := r.modelMap[req.Model]
	if !ok {
		r.mu.RUnlock()
		return nil, fmt.Errorf("no provider registered for model %q", req.Model)
	}
	p := r.providers[providerName]
	r.mu.RUnlock()

	return p.Complete(ctx, req)
}

func (r *Router) StreamRoute(ctx context.Context, req CompletionRequest, ch chan<- StreamChunk) error {
	r.mu.RLock()
	providerName, ok := r.modelMap[req.Model]
	if !ok {
		r.mu.RUnlock()
		return fmt.Errorf("no provider registered for model %q", req.Model)
	}
	p := r.providers[providerName]
	r.mu.RUnlock()

	return p.Stream(ctx, req, ch)
}
