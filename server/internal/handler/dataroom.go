package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/mrderivatives/foundry-of-agents/server/pkg/channels"
)

// POST /api/dataroom/visit — register or update visitor
func (h *Handler) handleDataroomVisit(w http.ResponseWriter, r *http.Request) {
	var body struct {
		VisitorID string `json:"visitor_id"`
	}
	readJSON(r, &body)

	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.RemoteAddr
	}
	ua := r.Header.Get("User-Agent")
	referrer := r.Header.Get("Referer")

	ctx := r.Context()

	if body.VisitorID != "" {
		// Returning visitor — update
		visitorID, err := uuid.Parse(body.VisitorID)
		if err == nil {
			h.DB.Exec(ctx,
				`UPDATE dataroom_visitor SET last_visit = now(), visit_count = visit_count + 1, ip_address = $2, user_agent = $3
				 WHERE id = $1`, visitorID, ip, ua)
			writeJSON(w, http.StatusOK, map[string]string{"visitor_id": visitorID.String()})
			return
		}
	}

	// New visitor
	var vid uuid.UUID
	err := h.DB.QueryRow(ctx,
		`INSERT INTO dataroom_visitor (ip_address, user_agent, referrer)
		 VALUES ($1, $2, $3) RETURNING id`, ip, ua, referrer).Scan(&vid)
	if err != nil {
		h.Logger.Error().Err(err).Msg("dataroom visit error")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"visitor_id": vid.String()})
}

// POST /api/dataroom/event — track events
func (h *Handler) handleDataroomEvent(w http.ResponseWriter, r *http.Request) {
	var body struct {
		VisitorID       string          `json:"visitor_id"`
		EventType       string          `json:"event_type"`
		Section         string          `json:"section"`
		DurationSeconds int             `json:"duration_seconds"`
		Metadata        json.RawMessage `json:"metadata"`
	}
	if err := readJSON(r, &body); err != nil || body.EventType == "" {
		errJSON(w, http.StatusBadRequest, "event_type required")
		return
	}

	ctx := r.Context()
	vid, _ := uuid.Parse(body.VisitorID)

	meta := body.Metadata
	if meta == nil {
		meta = json.RawMessage("{}")
	}

	h.DB.Exec(ctx,
		`INSERT INTO dataroom_event (visitor_id, event_type, section, duration_seconds, metadata)
		 VALUES ($1, $2, $3, $4, $5)`,
		vid, body.EventType, body.Section, body.DurationSeconds, meta)

	// Update visitor sections_viewed + total_time
	if body.Section != "" {
		h.DB.Exec(ctx,
			`UPDATE dataroom_visitor SET
			 sections_viewed = array_append(sections_viewed, $2),
			 deepest_section = $2,
			 total_time_seconds = total_time_seconds + $3
			 WHERE id = $1`, vid, body.Section, body.DurationSeconds)
	}
	if body.DurationSeconds > 0 && body.Section == "" {
		h.DB.Exec(ctx,
			`UPDATE dataroom_visitor SET total_time_seconds = total_time_seconds + $2 WHERE id = $1`,
			vid, body.DurationSeconds)
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// POST /api/dataroom/gate — email submission
func (h *Handler) handleDataroomGate(w http.ResponseWriter, r *http.Request) {
	var body struct {
		VisitorID string `json:"visitor_id"`
		Email     string `json:"email"`
	}
	if err := readJSON(r, &body); err != nil || body.Email == "" {
		errJSON(w, http.StatusBadRequest, "email required")
		return
	}

	ctx := r.Context()
	vid, _ := uuid.Parse(body.VisitorID)

	// Update visitor with email
	h.DB.Exec(ctx,
		`UPDATE dataroom_visitor SET email = $2 WHERE id = $1`, vid, body.Email)

	// Record gate_submit event
	emailMeta, _ := json.Marshal(map[string]string{"email": body.Email})
	h.DB.Exec(ctx,
		`INSERT INTO dataroom_event (visitor_id, event_type, metadata)
		 VALUES ($1, 'gate_submit', $2)`, vid, emailMeta)

	// Get visitor stats for Telegram notification
	var totalTime int
	var sections []string
	h.DB.QueryRow(ctx,
		`SELECT total_time_seconds, sections_viewed FROM dataroom_visitor WHERE id = $1`, vid).Scan(&totalTime, &sections)

	// Send Telegram notification to Mat
	if h.TelegramBotToken != "" {
		mins := totalTime / 60
		secs := totalTime % 60
		sectionsStr := "none yet"
		if len(sections) > 0 {
			sectionsStr = strings.Join(sections, ", ")
		}
		msg := fmt.Sprintf("🔔 *New Data Room Visitor*\nEmail: %s\nTime on page: %dm %ds\nSections viewed: %s",
			body.Email, mins, secs, sectionsStr)
		driver := channels.NewTelegramDriver(h.TelegramBotToken)
		driver.Send(ctx, "207851519", msg)
	}

	h.Logger.Info().Str("email", body.Email).Msg("dataroom gate submission")
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// GET /api/dataroom/stats?key=ADMIN_SECRET — admin stats
func (h *Handler) handleDataroomStats(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key != "forge-admin-2026" {
		errJSON(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	ctx := r.Context()

	var totalVisitors, totalEmails int
	var avgTime float64
	h.DB.QueryRow(ctx, `SELECT COUNT(*), COUNT(email), COALESCE(AVG(total_time_seconds),0) FROM dataroom_visitor`).Scan(&totalVisitors, &totalEmails, &avgTime)

	rows, err := h.DB.Query(ctx,
		`SELECT id, email, ip_address, visit_count, total_time_seconds, sections_viewed, deepest_section, first_visit, last_visit
		 FROM dataroom_visitor ORDER BY last_visit DESC LIMIT 100`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "query error")
		return
	}
	defer rows.Close()

	type visitorInfo struct {
		ID             uuid.UUID `json:"id"`
		Email          *string   `json:"email"`
		IP             *string   `json:"ip_address"`
		VisitCount     int       `json:"visit_count"`
		TotalTime      int       `json:"total_time_seconds"`
		Sections       []string  `json:"sections_viewed"`
		DeepestSection *string   `json:"deepest_section"`
		FirstVisit     time.Time `json:"first_visit"`
		LastVisit      time.Time `json:"last_visit"`
	}

	visitors := []visitorInfo{}
	for rows.Next() {
		var v visitorInfo
		rows.Scan(&v.ID, &v.Email, &v.IP, &v.VisitCount, &v.TotalTime, &v.Sections, &v.DeepestSection, &v.FirstVisit, &v.LastVisit)
		visitors = append(visitors, v)
	}

	// Section view counts
	sectionCounts := map[string]int{}
	sRows, _ := h.DB.Query(ctx,
		`SELECT section, COUNT(*) FROM dataroom_event
		 WHERE event_type = 'section_enter' AND section IS NOT NULL AND section != ''
		 GROUP BY section ORDER BY COUNT(*) DESC`)
	if sRows != nil {
		defer sRows.Close()
		for sRows.Next() {
			var s string
			var c int
			sRows.Scan(&s, &c)
			sectionCounts[s] = c
		}
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"summary": map[string]interface{}{
			"total_visitors":   totalVisitors,
			"total_emails":     totalEmails,
			"avg_time_seconds": int(avgTime),
		},
		"visitors":       visitors,
		"section_counts": sectionCounts,
	})
}
