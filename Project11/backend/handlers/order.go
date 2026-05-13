package handlers

import (
	"charging-station-backend/database"
	"charging-station-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateOrderRequest struct {
	StationID string `json:"stationId" binding:"required"`
	UserID    string `json:"userId"`
}

func CreateOrder(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var station models.ChargingStation
	if err := database.DB.Where("id = ?", req.StationID).First(&station).Error; err != nil {
		errorResponse(c, http.StatusNotFound, "station not found")
		return
	}

	if station.Status == "charging" {
		errorResponse(c, http.StatusBadRequest, "station is already charging")
		return
	}

	order := &models.ChargingOrder{
		ID:          uuid.New().String(),
		StationID:   req.StationID,
		UserID:      req.UserID,
		StartTime:   time.Now(),
		StartEnergy: 0,
		PricePerKwh: 1.5,
		Status:      "charging",
	}

	if err := database.DB.Create(order).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(c, order)
}

func GetOrders(c *gin.Context) {
	status := c.Query("status")
	stationID := c.Query("stationId")

	var orders []models.ChargingOrder
	query := database.DB.Model(&models.ChargingOrder{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if stationID != "" {
		query = query.Where("station_id = ?", stationID)
	}

	if err := query.Order("created_at DESC").Limit(100).Find(&orders).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(c, orders)
}

func GetOrder(c *gin.Context) {
	id := c.Param("id")
	var order models.ChargingOrder
	if err := database.DB.Where("id = ?", id).First(&order).Error; err != nil {
		errorResponse(c, http.StatusNotFound, "order not found")
		return
	}
	successResponse(c, order)
}

func EndOrder(c *gin.Context) {
	id := c.Param("id")

	var order models.ChargingOrder
	if err := database.DB.Where("id = ?", id).First(&order).Error; err != nil {
		errorResponse(c, http.StatusNotFound, "order not found")
		return
	}

	if order.Status != "charging" {
		errorResponse(c, http.StatusBadRequest, "order is not charging")
		return
	}

	now := time.Now()
	duration := now.Sub(order.StartTime).Hours()
	totalEnergy := order.StartEnergy + duration*60.0
	totalAmount := totalEnergy * order.PricePerKwh

	order.EndTime = now
	order.EndEnergy = totalEnergy
	order.TotalEnergy = totalEnergy
	order.TotalAmount = totalAmount
	order.Status = "completed"

	if err := database.DB.Save(&order).Error; err != nil {
		errorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	successResponse(c, order)
}

func GetRevenueStats(c *gin.Context) {
	var todayRevenue, totalRevenue float64
	var todayOrders, totalOrders int64

	today := time.Now().Format("2006-01-02")

	database.DB.Model(&models.ChargingOrder{}).
		Where("DATE(start_time) = ? AND status = ?", today, "completed").
		Select("COALESCE(SUM(total_amount), 0)").Scan(&todayRevenue)

	database.DB.Model(&models.ChargingOrder{}).
		Where("status = ?", "completed").
		Select("COALESCE(SUM(total_amount), 0)").Scan(&totalRevenue)

	database.DB.Model(&models.ChargingOrder{}).
		Where("DATE(start_time) = ?", today).Count(&todayOrders)

	database.DB.Model(&models.ChargingOrder{}).Count(&totalOrders)

	var todayEnergy, totalEnergy float64
	database.DB.Model(&models.ChargingOrder{}).
		Where("DATE(start_time) = ? AND status = ?", today, "completed").
		Select("COALESCE(SUM(total_energy), 0)").Scan(&todayEnergy)

	database.DB.Model(&models.ChargingOrder{}).
		Where("status = ?", "completed").
		Select("COALESCE(SUM(total_energy), 0)").Scan(&totalEnergy)

	stats := map[string]interface{}{
		"todayRevenue": todayRevenue,
		"totalRevenue": totalRevenue,
		"todayOrders":  todayOrders,
		"totalOrders":  totalOrders,
		"todayEnergy":  todayEnergy,
		"totalEnergy":  totalEnergy,
	}

	successResponse(c, stats)
}
