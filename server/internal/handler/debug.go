package handler

import (
	"net/http"
	"sync"
	"time"
	"encoding/json"
)

type debugEntry struct {
	Timestamp string `json:"timestamp"`
	Level     string `json:"level"`
	Message   string `json:"message"`
	Detail    string `json:"detail,omitempty"`
}

var (
	debugLog   []debugEntry
	debugMu    sync.Mutex
	maxEntries = 50
)

func AddDebugLog(level, message, detail string) {
	debugMu.Lock()
	defer debugMu.Unlock()
	debugLog = append(debugLog, debugEntry{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Level:     level,
		Message:   message,
		Detail:    detail,
	})
	if len(debugLog) > maxEntries {
		debugLog = debugLog[len(debugLog)-maxEntries:]
	}
}

func (h *Handler) handleDebugLog(w http.ResponseWriter, r *http.Request) {
	debugMu.Lock()
	defer debugMu.Unlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(debugLog)
}
