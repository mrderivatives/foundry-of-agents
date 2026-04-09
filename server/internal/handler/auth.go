package handler

import (
	"context"
	"crypto/ed25519"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/mr-tron/base58"
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
		h.Logger.Error().Err(err).Msg("failed to insert auth token")
		errJSON(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.Logger.Info().
		Str("email", body.Email).
		Str("url", "http://localhost:3000/auth/verify?token="+token).
		Msg("Magic link generated")

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
