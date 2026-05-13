package websocket

import (
	"charging-station-backend/database"
	"charging-station-backend/models"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func updateStationRealTime(stationID string, power, voltage, current, temperature float64, status string, now time.Time) {
	database.DB.Model(&models.ChargingStation{}).
		Where("id = ?", stationID).
		Updates(map[string]interface{}{
			"current_power":  power,
			"voltage":        voltage,
			"current":        current,
			"temperature":    temperature,
			"status":         status,
			"last_heartbeat": now,
		})
}

func savePowerRecord(stationID string, power, voltage, current, temperature float64, now time.Time) {
	record := &models.PowerRecord{
		StationID:   stationID,
		Power:       power,
		Voltage:     voltage,
		Current:     current,
		Temperature: temperature,
		RecordedAt:  now,
	}
	database.DB.Create(record)
}

func saveAlarm(stationID, alarmType, alarmLevel, message string) {
	alarm := &models.Alarm{
		StationID:    stationID,
		AlarmType:    alarmType,
		AlarmLevel:   alarmLevel,
		Message:      message,
		Acknowledged: false,
		Resolved:     false,
		CreatedAt:    time.Now(),
	}
	database.DB.Create(alarm)
}

func updateStationStatus(stationID, status string) {
	database.DB.Model(&models.ChargingStation{}).
		Where("id = ?", stationID).
		Update("status", status)
}

func updateCommandStatus(commandID int64, status, resultMsg string) {
	database.DB.Model(&models.ControlCommand{}).
		Where("id = ?", commandID).
		Updates(map[string]interface{}{
			"status":         status,
			"result_message": resultMsg,
			"executed_at":    time.Now(),
		})
}

func ServeDeviceWS(c *gin.Context) {
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	stationID := c.Query("stationId")
	if stationID == "" {
		c.JSON(400, gin.H{"error": "stationId is required"})
		return
	}

	var station models.ChargingStation
	if err := database.DB.Where("id = ?", stationID).First(&station).Error; err != nil {
		c.JSON(404, gin.H{"error": "station not found"})
		return
	}

	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	conn := &Connection{
		ws:   ws,
		send: make(chan []byte, 256),
	}

	client := &Client{
		ID:         uuid.New().String(),
		Type:       ClientTypeDevice,
		StationID:  stationID,
		Conn:       conn,
		Send:       conn.send,
		LastActive: time.Now(),
	}

	GlobalHub.register <- client

	go conn.writePump(client)
	go conn.readPump(client)
}

func ServeUserWS(c *gin.Context) {
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	conn := &Connection{
		ws:   ws,
		send: make(chan []byte, 256),
	}

	client := &Client{
		ID:         uuid.New().String(),
		Type:       ClientTypeUser,
		Conn:       conn,
		Send:       conn.send,
		LastActive: time.Now(),
	}

	GlobalHub.register <- client

	go conn.writePump(client)
	go conn.readPump(client)
}

func SendControlCommand(stationID, commandType string, commandData map[string]interface{}) (int64, error) {
	if !GlobalHub.IsDeviceOnline(stationID) {
		return 0, fmt.Errorf("device %s is offline", stationID)
	}

	jsonData, _ := json.Marshal(commandData)
	command := &models.ControlCommand{
		StationID:   stationID,
		CommandType: commandType,
		CommandData: jsonData,
		Status:      "pending",
		CreatedAt:   time.Now(),
	}

	if err := database.DB.Create(command).Error; err != nil {
		return 0, err
	}

	msgData := map[string]interface{}{
		"commandId":   command.ID,
		"commandType": commandType,
		"data":        commandData,
	}
	msgDataBytes, _ := json.Marshal(msgData)

	msg := &WSMessage{
		Type:    MsgTypeControl,
		Data:    msgDataBytes,
		Time:    time.Now().Unix(),
	}

	GlobalHub.SendToDevice(stationID, msg)

	database.DB.Model(command).Update("status", "sent")

	return command.ID, nil
}

func SaveControlCommand(stationID, commandType string, commandData map[string]interface{}, status, resultMessage string) (int64, error) {
	jsonData, _ := json.Marshal(commandData)
	command := &models.ControlCommand{
		StationID:     stationID,
		CommandType:   commandType,
		CommandData:   jsonData,
		Status:        status,
		ResultMessage: resultMessage,
		CreatedAt:     time.Now(),
		ExecutedAt:    time.Now(),
	}

	if err := database.DB.Create(command).Error; err != nil {
		return 0, err
	}

	return command.ID, nil
}

func IsDeviceOnline(stationID string) bool {
	return GlobalHub.IsDeviceOnline(stationID)
}
