package channels

import "context"

type Channel interface {
	Send(ctx context.Context, target string, message string) error
}

type TelegramDriver struct {
	botToken string
}

func NewTelegramDriver(botToken string) *TelegramDriver {
	return &TelegramDriver{botToken: botToken}
}

func (t *TelegramDriver) Send(_ context.Context, _ string, _ string) error {
	return nil
}
