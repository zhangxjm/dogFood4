package websocket

import (
	"charging-station-backend/database"
	"charging-station-backend/models"
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"
)

type MessageType string

const (
	MsgTypeHeartbeat    MessageType = "heartbeat"
	MsgTypePowerReport  MessageType = "power_report"
	MsgTypeAlarm        MessageType = "alarm"
	MsgTypeControl      MessageType = "control"
	MsgTypeControlAck   MessageType = "control_ack"
	MsgTypeStatusUpdate MessageType = "status_update"
	MsgTypeOrderUpdate  MessageType = "order_update"
)

type WSMessage struct {
	Type    MessageType     `json:"type"`
	StationID string         `json:"stationId,omitempty"`
	Data    json.RawMessage `json:"data"`
	Time    int64           `json:"time"`
}

type ClientType string

const (
	ClientTypeDevice ClientType = "device"
	ClientTypeUser   ClientType = "user"
)

type Client struct {
	ID         string
	Type       ClientType
	StationID  string
	Conn       *Connection
	Send       chan []byte
	LastActive time.Time
}

type Hub struct {
	clients    map[string]*Client
	devices    map[string]*Client
	users      map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan *WSMessage
	mu         sync.RWMutex
}

var GlobalHub = &Hub{
	clients:    make(map[string]*Client),
	devices:    make(map[string]*Client),
	users:      make(map[*Client]bool),
	register:   make(chan *Client),
	unregister: make(chan *Client),
	broadcast:  make(chan *WSMessage, 1000),
}

func (h *Hub) Run() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			if client.Type == ClientTypeDevice {
				h.devices[client.StationID] = client
				h.updateStationStatus(client.StationID, "online")
				log.Printf("Device connected: %s", client.StationID)
			} else {
				h.users[client] = true
				log.Printf("User connected: %s", client.ID)
			}
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				if client.Type == ClientTypeDevice {
					delete(h.devices, client.StationID)
					h.updateStationStatus(client.StationID, "offline")
					log.Printf("Device disconnected: %s", client.StationID)
				} else {
					delete(h.users, client)
					log.Printf("User disconnected: %s", client.ID)
				}
				close(client.Send)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.handleBroadcast(message)

		case <-ticker.C:
			h.checkTimeouts()
		}
	}
}

func (h *Hub) handleBroadcast(msg *WSMessage) {
	msgBytes, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Failed to marshal message: %v", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	if msg.Type == MsgTypeControl && msg.StationID != "" {
		if device, ok := h.devices[msg.StationID]; ok {
			select {
			case device.Send <- msgBytes:
			default:
				close(device.Send)
				delete(h.clients, device.ID)
				delete(h.devices, device.StationID)
			}
		}
		return
	}

	for user := range h.users {
		select {
		case user.Send <- msgBytes:
		default:
			close(user.Send)
			delete(h.clients, user.ID)
			delete(h.users, user)
		}
	}
}

func (h *Hub) updateStationStatus(stationID string, status string) {
	now := time.Now()
	database.DB.Model(&models.ChargingStation{}).
		Where("id = ?", stationID).
		Updates(map[string]interface{}{
			"status":          status,
			"last_heartbeat":  now,
		})

	statusMsg := &WSMessage{
		Type:      MsgTypeStatusUpdate,
		StationID: stationID,
		Time:      now.Unix(),
	}
	statusData, _ := json.Marshal(map[string]interface{}{
		"status":         status,
		"lastHeartbeat":  now,
	})
	statusMsg.Data = statusData
	h.broadcast <- statusMsg
}

func (h *Hub) checkTimeouts() {
	h.mu.Lock()
	defer h.mu.Unlock()

	now := time.Now()
	timeout := time.Duration(60) * time.Second

	for stationID, client := range h.devices {
		if now.Sub(client.LastActive) > timeout {
			h.updateStationStatus(stationID, "offline")
			close(client.Send)
			delete(h.clients, client.ID)
			delete(h.devices, stationID)
			log.Printf("Device timed out: %s", stationID)
		}
	}
}

func (h *Hub) IsDeviceOnline(stationID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	_, ok := h.devices[stationID]
	return ok
}

func (h *Hub) Broadcast(msg *WSMessage) {
	h.broadcast <- msg
}

func (h *Hub) SendToDevice(stationID string, msg *WSMessage) {
	msg.StationID = stationID
	h.broadcast <- msg
}

func (h *Hub) GetOnlineDevices() []string {
	h.mu.RLock()
	defer h.mu.RUnlock()
	devices := make([]string, 0, len(h.devices))
	for id := range h.devices {
		devices = append(devices, id)
	}
	return devices
}

func StartHub() {
	go GlobalHub.Run()
	go startPowerRecordConsumer()
}

func startPowerRecordConsumer() {
	for {
		time.Sleep(100 * time.Millisecond)
	}
}

func CacheStationData(stationID string, data interface{}) {
	ctx := context.Background()
	jsonData, _ := json.Marshal(data)
	database.RedisClient.Set(ctx, "station:"+stationID, jsonData, 5*time.Minute)
}

func GetCachedStationData(stationID string) (string, error) {
	ctx := context.Background()
	return database.RedisClient.Get(ctx, "station:"+stationID).Result()
}

func PublishToChannel(channel string, message interface{}) {
	ctx := context.Background()
	jsonData, _ := json.Marshal(message)
	database.RedisClient.Publish(ctx, channel, jsonData)
}
