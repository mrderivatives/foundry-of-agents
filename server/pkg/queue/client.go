package queue

import (
	"fmt"

	"github.com/hibiken/asynq"
)

type Client struct {
	inner *asynq.Client
}

func NewClient(redisURL string) (*Client, error) {
	opt, err := asynq.ParseRedisURI(redisURL)
	if err != nil {
		return nil, fmt.Errorf("parse redis url: %w", err)
	}
	return &Client{inner: asynq.NewClient(opt)}, nil
}

func (c *Client) Enqueue(taskType string, payload []byte, opts ...asynq.Option) (*asynq.TaskInfo, error) {
	task := asynq.NewTask(taskType, payload)
	return c.inner.Enqueue(task, opts...)
}

func (c *Client) Close() error {
	return c.inner.Close()
}
