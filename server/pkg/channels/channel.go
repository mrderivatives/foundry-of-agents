package channels

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

type Channel interface {
	Send(ctx context.Context, target string, message string) error
}

type TelegramDriver struct {
	botToken string
	client   *http.Client
}

func NewTelegramDriver(botToken string) *TelegramDriver {
	return &TelegramDriver{botToken: botToken, client: &http.Client{}}
}

func (t *TelegramDriver) Send(ctx context.Context, chatID string, message string) error {
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", t.botToken)

	resp, err := t.client.PostForm(apiURL, url.Values{
		"chat_id":    {chatID},
		"text":       {message},
		"parse_mode": {"Markdown"},
	})
	if err != nil {
		return fmt.Errorf("telegram send: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("telegram API error %d: %s", resp.StatusCode, string(body))
	}
	return nil
}
