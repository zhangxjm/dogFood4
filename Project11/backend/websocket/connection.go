package websocket

import (
	"bytes"
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 51200
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

type Connection struct {
	ws   *websocket.Conn
	send chan []byte
}

func (c *Connection) readPump(client *Client) {
	defer func() {
		GlobalHub.unregister <- client
		c.ws.Close()
	}()

	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error {
		c.ws.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.ws.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket read error: %v", err)
			}
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		handleMessage(client, message)
	}
}

func (c *Connection) writePump(client *Client) {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.ws.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.ws.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.ws.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.ws.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.ws.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.ws.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func handleMessage(client *Client, message []byte) {
	var msg WSMessage
	if err := json.Unmarshal(message, &msg); err != nil {
		log.Printf("Failed to parse message: %v", err)
		return
	}

	client.LastActive = time.Now()

	switch msg.Type {
	case MsgTypeHeartbeat:
		handleHeartbeat(client, &msg)
	case MsgTypePowerReport:
		handlePowerReport(client, &msg)
	case MsgTypeAlarm:
		handleAlarmReport(client, &msg)
	case MsgTypeControlAck:
		handleControlAck(client, &msg)
	default:
		log.Printf("Unknown message type: %s", msg.Type)
	}
}

func handleHeartbeat(client *Client, msg *WSMessage) {
	if client.Type == ClientTypeDevice {
		client.LastActive = time.Now()
		response := &WSMessage{
			Type: MsgTypeHeartbeat,
			Time: time.Now().Unix(),
		}
		GlobalHub.SendToDevice(client.StationID, response)
	}
}

func handlePowerReport(client *Client, msg *WSMessage) {
	if client.Type != ClientTypeDevice {
		return
	}

	var data map[string]interface{}
	if err := json.Unmarshal(msg.Data, &data); err != nil {
		log.Printf("Failed to parse power data: %v", err)
		return
	}

	power, _ := data["power"].(float64)
	voltage, _ := data["voltage"].(float64)
	current, _ := data["current"].(float64)
	temperature, _ := data["temperature"].(float64)

	stationID := client.StationID
	now := time.Now()

	var status string
	if power > 0 {
		status = "charging"
	} else {
		status = "idle"
	}

	go updateStationRealTime(stationID, power, voltage, current, temperature, status, now)
	go savePowerRecord(stationID, power, voltage, current, temperature, now)

	msg.StationID = stationID
	GlobalHub.Broadcast(msg)
}

func handleAlarmReport(client *Client, msg *WSMessage) {
	if client.Type != ClientTypeDevice {
		return
	}

	var data map[string]interface{}
	if err := json.Unmarshal(msg.Data, &data); err != nil {
		log.Printf("Failed to parse alarm data: %v", err)
		return
	}

	alarmType, _ := data["alarmType"].(string)
	alarmLevel, _ := data["alarmLevel"].(string)
	message, _ := data["message"].(string)

	if alarmLevel == "" {
		alarmLevel = "warning"
	}

	go saveAlarm(client.StationID, alarmType, alarmLevel, message)
	go updateStationStatus(client.StationID, "error")

	msg.StationID = client.StationID
	GlobalHub.Broadcast(msg)
}

func handleControlAck(client *Client, msg *WSMessage) {
	if client.Type != ClientTypeDevice {
		return
	}

	var data map[string]interface{}
	if err := json.Unmarshal(msg.Data, &data); err != nil {
		return
	}

	success, _ := data["success"].(bool)
	resultMsg, _ := data["message"].(string)
	commandID, _ := data["commandId"].(float64)

	status := "success"
	if !success {
		status = "failed"
	}

	go updateCommandStatus(int64(commandID), status, resultMsg)

	msg.StationID = client.StationID
	GlobalHub.Broadcast(msg)
}
