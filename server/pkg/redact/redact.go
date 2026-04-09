package redact

import "regexp"

var (
	emailPattern = regexp.MustCompile(`[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}`)
	phonePattern = regexp.MustCompile(`\b\d{3}[-.]?\d{3}[-.]?\d{4}\b`)
)

func PII(input string) string {
	result := emailPattern.ReplaceAllString(input, "[REDACTED_EMAIL]")
	result = phonePattern.ReplaceAllString(result, "[REDACTED_PHONE]")
	return result
}
