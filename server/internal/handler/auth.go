package handler

import (
	"bytes"
	"context"
	"crypto/ed25519"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/mr-tron/base58"

	"github.com/mrderivatives/foundry-of-agents/server/internal/auth"
)

// POST /api/auth/magic-link
func (h *Handler) handleMagicLink(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if err := readJSON(r, &body); err != nil || body.Email == "" {
		errJSON(w, http.StatusBadRequest, "email is required")
		return
	}

	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		h.Logger.Error().Err(err).Msg("failed to generate token")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}
	token := hex.EncodeToString(tokenBytes)

	ctx := r.Context()
	_, err := h.DB.Exec(ctx,
		`INSERT INTO auth_token (email, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
		body.Email, token)
	if err != nil {
		h.Logger.Error().Err(err).Str("email", body.Email).Msg("failed to insert auth token")
		errJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	origin := os.Getenv("CORS_ORIGIN")
	if origin == "" {
		origin = "https://forge-of-agents.vercel.app"
	}
	verifyURL := fmt.Sprintf("%s/auth/verify?token=%s", origin, token)

	h.Logger.Info().
		Str("email", body.Email).
		Str("url", verifyURL).
		Msg("Magic link generated")

	// Send magic link via Supabase GoTrue (sends to any email)
	if h.SupabaseURL != "" && h.SupabaseAnonKey != "" {
		go func() {
			reqBody, _ := json.Marshal(map[string]interface{}{
				"email": body.Email,
			})
			callbackURL := origin + "/auth/callback"
			apiURL := h.SupabaseURL + "/auth/v1/magiclink?redirect_to=" + url.QueryEscape(callbackURL)
			req, _ := http.NewRequest("POST", apiURL, bytes.NewReader(reqBody))
			req.Header.Set("apikey", h.SupabaseAnonKey)
			req.Header.Set("Content-Type", "application/json")
			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				h.Logger.Error().Err(err).Msg("failed to send supabase magic link")
				return
			}
			defer resp.Body.Close()
			if resp.StatusCode >= 300 {
				b, _ := io.ReadAll(resp.Body)
				h.Logger.Error().Int("status", resp.StatusCode).Str("body", string(b)).Msg("supabase magiclink error")
			} else {
				h.Logger.Info().Str("email", body.Email).Msg("supabase magic link sent")
			}
		}()
	} else if h.ResendAPIKey != "" {
		// Fallback: Resend (only works for verified emails)
		go func() {
			emailHTML := fmt.Sprintf(`<div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:40px 20px;background:#0a0a0a;color:#fafafa"><h1 style="font-size:24px">Foundry of Agents</h1><p><a href="%s" style="display:inline-block;padding:12px 32px;background:#8b5cf6;color:white;text-decoration:none;border-radius:8px;font-weight:600">Sign In</a></p><p style="color:#71717a;font-size:13px">Expires in 15 minutes.</p></div>`, verifyURL)
			reqBody, _ := json.Marshal(map[string]interface{}{
				"from": "Foundry <onboarding@resend.dev>", "to": []string{body.Email},
				"subject": "Your Magic Link", "html": emailHTML,
			})
			req, _ := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(reqBody))
			req.Header.Set("Authorization", "Bearer "+h.ResendAPIKey)
			req.Header.Set("Content-Type", "application/json")
			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				return
			}
			resp.Body.Close()
		}()
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Magic link sent"})
}

// POST /api/auth/verify
func (h *Handler) handleVerify(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token string `json:"token"`
	}
	if err := readJSON(r, &body); err != nil || body.Token == "" {
		errJSON(w, http.StatusBadRequest, "token is required")
		return
	}

	ctx := r.Context()

	// Look up and consume the token
	var email string
	err := h.DB.QueryRow(ctx,
		`UPDATE auth_token SET used_at = NOW()
		 WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()
		 RETURNING email`, body.Token).Scan(&email)
	if err != nil {
		errJSON(w, http.StatusUnauthorized, "invalid or expired token")
		return
	}

	userID, workspaceID, err := h.findOrCreateUser(ctx, email, "")
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to find or create user")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	tokenStr, err := h.issueJWT(userID, workspaceID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to issue JWT")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"token": tokenStr,
		"user": map[string]interface{}{
			"id":    userID.String(),
			"email": email,
		},
		"workspace": map[string]interface{}{
			"id": workspaceID.String(),
		},
	})
}

// POST /api/auth/siws
func (h *Handler) handleSIWS(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Message   string `json:"message"`
		Signature string `json:"signature"`
		PublicKey string `json:"publicKey"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if body.Message == "" || body.Signature == "" || body.PublicKey == "" {
		errJSON(w, http.StatusBadRequest, "message, signature, and publicKey are required")
		return
	}

	pubKeyBytes, err := base58.Decode(body.PublicKey)
	if err != nil || len(pubKeyBytes) != ed25519.PublicKeySize {
		errJSON(w, http.StatusBadRequest, "invalid public key")
		return
	}

	sigBytes, err := base58.Decode(body.Signature)
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid signature")
		return
	}

	if !ed25519.Verify(ed25519.PublicKey(pubKeyBytes), []byte(body.Message), sigBytes) {
		errJSON(w, http.StatusUnauthorized, "signature verification failed")
		return
	}

	walletAddress := body.PublicKey
	walletEmail := walletAddress + "@solana"

	ctx := r.Context()
	userID, workspaceID, err := h.findOrCreateUser(ctx, walletEmail, walletAddress)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to find or create user for wallet")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	tokenStr, err := h.issueJWT(userID, workspaceID)
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to issue JWT")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"token": tokenStr,
		"user": map[string]interface{}{
			"id":             userID.String(),
			"wallet_address": walletAddress,
		},
		"workspace": map[string]interface{}{
			"id": workspaceID.String(),
		},
	})
}

// POST /api/auth/refresh
func (h *Handler) handleRefresh(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenStr == "" || tokenStr == authHeader {
		errJSON(w, http.StatusUnauthorized, "missing authorization header")
		return
	}

	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return h.JWTSecret, nil
	})
	if err != nil || !token.Valid {
		errJSON(w, http.StatusUnauthorized, "invalid token")
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		errJSON(w, http.StatusUnauthorized, "invalid claims")
		return
	}

	sub, _ := claims.GetSubject()
	userID, err := uuid.Parse(sub)
	if err != nil {
		errJSON(w, http.StatusUnauthorized, "invalid user id")
		return
	}

	wsIDStr, _ := claims["workspace_id"].(string)
	workspaceID, err := uuid.Parse(wsIDStr)
	if err != nil {
		errJSON(w, http.StatusUnauthorized, "invalid workspace id")
		return
	}

	newToken, err := h.issueJWT(userID, workspaceID)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"token": newToken})
}

// DELETE /api/auth/session
func (h *Handler) handleLogout(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

// POST /api/auth/supabase-verify — exchange Supabase access token for our JWT
func (h *Handler) handleSupabaseVerify(w http.ResponseWriter, r *http.Request) {
	var body struct {
		AccessToken string `json:"access_token"`
	}
	if err := readJSON(r, &body); err != nil || body.AccessToken == "" {
		errJSON(w, http.StatusBadRequest, "access_token is required")
		return
	}

	if h.SupabaseURL == "" || h.SupabaseAnonKey == "" {
		errJSON(w, http.StatusInternalServerError, "supabase not configured")
		return
	}

	// Verify token with Supabase — get user info
	apiURL := h.SupabaseURL + "/auth/v1/user"
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("apikey", h.SupabaseAnonKey)
	req.Header.Set("Authorization", "Bearer "+body.AccessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		h.Logger.Error().Err(err).Msg("supabase user lookup failed")
		errJSON(w, http.StatusInternalServerError, "failed to verify token")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		h.Logger.Error().Int("status", resp.StatusCode).Str("body", string(b)).Msg("supabase verify error")
		errJSON(w, http.StatusUnauthorized, "invalid supabase token")
		return
	}

	var supaUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&supaUser); err != nil || supaUser.Email == "" {
		errJSON(w, http.StatusUnauthorized, "could not extract email from supabase token")
		return
	}

	// Find or create user in our DB
	ctx := r.Context()
	userID, workspaceID, err := h.findOrCreateUser(ctx, supaUser.Email, "")
	if err != nil {
		h.Logger.Error().Err(err).Msg("failed to find or create user from supabase")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	tokenStr, err := h.issueJWT(userID, workspaceID)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"token": tokenStr,
		"user": map[string]interface{}{
			"id":    userID.String(),
			"email": supaUser.Email,
		},
		"workspace": map[string]interface{}{
			"id": workspaceID.String(),
		},
	})
}

// GET /api/auth/me
func (h *Handler) handleMe(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.GetUserID(r.Context())

	var email, name string
	err := h.DB.QueryRow(r.Context(),
		`SELECT email, COALESCE(name, '') FROM "user" WHERE id = $1`, userID).Scan(&email, &name)
	if err != nil {
		errJSON(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"id":    userID.String(),
		"email": email,
		"name":  name,
	})
}

// --- helpers ---

func (h *Handler) issueJWT(userID, workspaceID uuid.UUID) (string, error) {
	claims := jwt.MapClaims{
		"sub":          userID.String(),
		"workspace_id": workspaceID.String(),
		"exp":          time.Now().Add(7 * 24 * time.Hour).Unix(),
		"iat":          time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(h.JWTSecret)
}

func (h *Handler) findOrCreateUser(ctx context.Context, email, walletAddress string) (uuid.UUID, uuid.UUID, error) {
	// Find or create user
	var userID uuid.UUID
	// Derive a display name from email
	name := strings.Split(email, "@")[0]
	if name == "" {
		name = "User"
	}
	err := h.DB.QueryRow(ctx,
		`INSERT INTO "user" (email, name) VALUES ($1, $2)
		 ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
		 RETURNING id`, email, name).Scan(&userID)
	if err != nil {
		return uuid.Nil, uuid.Nil, err
	}

	// Find existing workspace membership
	var workspaceID uuid.UUID
	err = h.DB.QueryRow(ctx,
		`SELECT w.id FROM workspace w
		 JOIN member m ON m.workspace_id = w.id
		 WHERE m.user_id = $1
		 LIMIT 1`, userID).Scan(&workspaceID)

	if err != nil {
		// Create default workspace
		slug := strings.ReplaceAll(strings.ToLower(email), "@", "-at-")
		if len(slug) > 60 {
			slug = slug[:60]
		}
		err = h.DB.QueryRow(ctx,
			`INSERT INTO workspace (name, slug) VALUES ($1, $2) RETURNING id`,
			"My Workspace", slug).Scan(&workspaceID)
		if err != nil {
			return uuid.Nil, uuid.Nil, err
		}
		_, err = h.DB.Exec(ctx,
			`INSERT INTO member (workspace_id, user_id, role) VALUES ($1, $2, 'owner')`,
			workspaceID, userID)
		if err != nil {
			return uuid.Nil, uuid.Nil, err
		}
	}

	return userID, workspaceID, nil
}
