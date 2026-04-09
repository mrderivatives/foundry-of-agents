package realtime

import (
	"encoding/json"
	"sync"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

type Client struct {
	conn        *websocket.Conn
	send        chan []byte
	hub         *Hub
	workspaceID string
}

type Hub struct {
	mu         sync.RWMutex
	rooms      map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan RoomMessage
}

type RoomMessage struct {
	Room    string
	Payload []byte
}

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan RoomMessage, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			room := client.workspaceID
			if h.rooms[room] == nil {
				h.rooms[room] = make(map[*Client]bool)
			}
			h.rooms[room][client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			room := client.workspaceID
			if clients, ok := h.rooms[room]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.send)
					if len(clients) == 0 {
						delete(h.rooms, room)
					}
				}
			}
			h.mu.Unlock()

		case msg := <-h.broadcast:
			h.mu.RLock()
			if clients, ok := h.rooms[msg.Room]; ok {
				for client := range clients {
					select {
					case client.send <- msg.Payload:
					default:
						close(client.send)
						delete(clients, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) Broadcast(room string, payload interface{}) {
	data, err := json.Marshal(payload)
	if err != nil {
		log.Error().Err(err).Msg("failed to marshal broadcast payload")
		return
	}
	h.broadcast <- RoomMessage{Room: room, Payload: data}
}

func (h *Hub) BroadcastEvent(workspaceID string, event string, payload interface{}) {
	data := map[string]interface{}{
		"event": event,
		"data":  payload,
	}
	h.Broadcast(workspaceID, data)
}

// HandleConnectionWithToken authenticates the WebSocket connection using a JWT token.
func (h *Hub) HandleConnectionWithToken(conn *websocket.Conn, tokenStr string, jwtSecret []byte) {
	workspaceID := "default"

	if tokenStr != "" {
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			log.Warn().Err(err).Msg("websocket: invalid JWT, closing")
			conn.WriteMessage(websocket.CloseMessage,
				websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "invalid token"))
			conn.Close()
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if ok {
			if wsID, ok := claims["workspace_id"].(string); ok {
				workspaceID = wsID
			}
		}
	}

	client := &Client{
		conn:        conn,
		send:        make(chan []byte, 256),
		hub:         h,
		workspaceID: workspaceID,
	}

	h.register <- client

	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()
	for msg := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}
