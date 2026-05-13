package handlers

import (
	"charging-station-backend/database"
	"charging-station-backend/models"
	"charging-station-backend/simulator"
	"charging-station-backend/websocket"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func successResponse(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

func errorResponse(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
	})
}

func GetStations(c *gin.Context) {
	var stations []models.ChargingStation
	if err := database.DB.Order("id").Find(&stations).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	successResponse(c, stations)
}

func GetStation(c *gin.Context) {
	id := c.Param("id")
	var station models.ChargingStation
	if err := database.DB.Where("id = ?", id).First(&station).Error; err != nil {
		errorResponse(c, http.StatusNotFound, "station not found")
		return
	}
	successResponse(c, station)
}

func GetStationStats(c *gin.Context) {
	var total int64
	var onlineCount, offlineCount, chargingCount, errorCount int64

	database.DB.Model(&models.ChargingStation{}).Count(&total)
	database.DB.Model(&models.ChargingStation{}).Where("status IN ?", []string{"online", "idle", "charging"}).Count(&onlineCount)
	database.DB.Model(&models.ChargingStation{}).Where("status = ?", "offline").Count(&offlineCount)
	database.DB.Model(&models.ChargingStation{}).Where("status = ?", "charging").Count(&chargingCount)
	database.DB.Model(&models.ChargingStation{}).Where("status = ?", "error").Count(&errorCount)

	var totalPower float64
	database.DB.Model(&models.ChargingStation{}).Select("COALESCE(SUM(current_power), 0)").Scan(&totalPower)

	var todayEnergy float64
	today := time.Now().Format("2006-01-02")
	database.DB.Model(&models.PowerRecord{}).
		Where("DATE(recorded_at) = ?", today).
		Select("COALESCE(SUM(power) / 60, 0)").Scan(&todayEnergy)

	stats := map[string]interface{}{
		"total":        total,
		"online":       onlineCount,
		"offline":      offlineCount,
		"charging":     chargingCount,
		"error":        errorCount,
		"totalPower":   totalPower,
		"todayEnergy":  todayEnergy,
	}

	successResponse(c, stats)
}

func GetPowerHistory(c *gin.Context) {
	stationID := c.Query("stationId")
	hours := c.DefaultQuery("hours", "1")

	var records []models.PowerRecord
	query := database.DB.Model(&models.PowerRecord{})

	if stationID != "" {
		query = query.Where("station_id = ?", stationID)
	}

	since := time.Now().Add(-parseDuration(hours))
	query = query.Where("recorded_at > ?", since).Order("recorded_at ASC")

	if err := query.Find(&records).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(c, records)
}

func parseDuration(hours string) time.Duration {
	h, _ := time.ParseDuration(hours + "h")
	if h == 0 {
		h = 1 * time.Hour
	}
	return h
}

type ControlRequest struct {
	CommandType string                 `json:"commandType" binding:"required"`
	Data        map[string]interface{} `json:"data"`
}

func handleControlCommand(stationID, commandType string, commandData map[string]interface{}) (int64, string, error) {
	var station models.ChargingStation
	if err := database.DB.Where("id = ?", stationID).First(&station).Error; err != nil {
		return 0, "", fmt.Errorf("station %s not found", stationID)
	}

	isOnline := websocket.IsDeviceOnline(stationID)
	isSimulated := simulator.GetSimulatedStation(stationID) != nil

	if !isOnline && !isSimulated {
		return 0, "", fmt.Errorf("device %s is offline", stationID)
	}

	if isOnline {
		commandID, err := websocket.SendControlCommand(stationID, commandType, commandData)
		return commandID, "sent", err
	}

	if isSimulated {
		var success bool
		var resultMsg string

		switch commandType {
		case "start_charging":
			success = simulator.StartCharging(stationID)
			resultMsg = "Simulator: Charging started"
		case "stop_charging":
			success = simulator.StopCharging(stationID)
			resultMsg = "Simulator: Charging stopped"
		case "reset":
			success = simulator.ResetStation(stationID)
			resultMsg = "Simulator: Station reset"
		default:
			success = true
			resultMsg = "Simulator: Command executed"
		}

		if !success {
			return 0, "", fmt.Errorf("simulator command execution failed")
		}

		status := "success"
		commandID, err := websocket.SaveControlCommand(stationID, commandType, commandData, status, resultMsg)
		return commandID, status, err
	}

	return 0, "", fmt.Errorf("device %s is offline", stationID)
}

func SendControl(c *gin.Context) {
	stationID := c.Param("id")

	var req ControlRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	commandID, status, err := handleControlCommand(stationID, req.CommandType, req.Data)
	if err != nil {
		errorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	successResponse(c, map[string]interface{}{
		"commandId": commandID,
		"status":    status,
	})
}

func StartCharging(c *gin.Context) {
	stationID := c.Param("id")
	commandData := map[string]interface{}{
		"action": "start",
	}
	commandID, _, err := handleControlCommand(stationID, "start_charging", commandData)
	if err != nil {
		errorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	successResponse(c, map[string]interface{}{"commandId": commandID})
}

func StopCharging(c *gin.Context) {
	stationID := c.Param("id")
	commandData := map[string]interface{}{
		"action": "stop",
	}
	commandID, _, err := handleControlCommand(stationID, "stop_charging", commandData)
	if err != nil {
		errorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	successResponse(c, map[string]interface{}{"commandId": commandID})
}

func ResetStation(c *gin.Context) {
	stationID := c.Param("id")
	commandData := map[string]interface{}{
		"action": "reset",
	}
	commandID, _, err := handleControlCommand(stationID, "reset", commandData)
	if err != nil {
		errorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	successResponse(c, map[string]interface{}{"commandId": commandID})
}
