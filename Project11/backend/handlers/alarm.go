package handlers

import (
	"charging-station-backend/database"
	"charging-station-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetAlarms(c *gin.Context) {
	resolved := c.Query("resolved")
	stationID := c.Query("stationId")
	level := c.Query("level")

	var alarms []models.Alarm
	query := database.DB.Model(&models.Alarm{})

	if resolved != "" {
		query = query.Where("resolved = ?", resolved == "true")
	}
	if stationID != "" {
		query = query.Where("station_id = ?", stationID)
	}
	if level != "" {
		query = query.Where("alarm_level = ?", level)
	}

	if err := query.Order("created_at DESC").Limit(100).Find(&alarms).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(c, alarms)
}

func AcknowledgeAlarm(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Model(&models.Alarm{}).
		Where("id = ?", id).
		Update("acknowledged", true).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(c, nil)
}

func ResolveAlarm(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Model(&models.Alarm{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"resolved":    true,
			"resolved_at": time.Now(),
		}).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(c, nil)
}

func GetAlarmStats(c *gin.Context) {
	var total, unresolved, critical, warning int64

	database.DB.Model(&models.Alarm{}).Count(&total)
	database.DB.Model(&models.Alarm{}).Where("resolved = ?", false).Count(&unresolved)
	database.DB.Model(&models.Alarm{}).Where("alarm_level = ? AND resolved = ?", "critical", false).Count(&critical)
	database.DB.Model(&models.Alarm{}).Where("alarm_level = ? AND resolved = ?", "warning", false).Count(&warning)

	stats := map[string]interface{}{
		"total":      total,
		"unresolved": unresolved,
		"critical":   critical,
		"warning":    warning,
	}

	successResponse(c, stats)
}
