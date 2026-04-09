package handler

import "net/http"

func (h *Handler) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"version": "0.1.0",
	})
}
