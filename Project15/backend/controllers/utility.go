package controllers

import (
	"dormitory/config"
	"dormitory/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetUtilities(c *gin.Context) {
	month := c.Query("month")
	roomID := c.Query("room_id")

	var utilities []models.Utility
	db := config.GetDB()
	query := db.Model(&models.Utility{})

	if month != "" {
		query = query.Where("month = ?", month)
	}
	if roomID != "" {
		query = query.Where("room_id = ?", roomID)
	}

	query.Find(&utilities)
	c.JSON(http.StatusOK, gin.H{"data": utilities})
}

func CreateUtility(c *gin.Context) {
	var input models.Utility
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Month == "" {
		input.Month = time.Now().Format("2006-01")
	}

	db := config.GetDB()
	var existing models.Utility
	if db.Where("room_id = ? AND month = ?", input.RoomID, input.Month).First(&existing).Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Utility record already exists for this room and month"})
		return
	}

	var room models.Room
	if err := db.First(&room, input.RoomID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room not found"})
		return
	}

	if input.TotalCost == 0 {
		input.TotalCost = input.Electricity*0.6 + input.Water*3.5
	}

	db.Create(&input)
	c.JSON(http.StatusCreated, gin.H{"data": input})
}

func UpdateUtility(c *gin.Context) {
	id := c.Param("id")
	var utility models.Utility
	db := config.GetDB()
	if err := db.First(&utility, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Utility record not found"})
		return
	}

	var input models.Utility
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.TotalCost == 0 {
		input.TotalCost = input.Electricity*0.6 + input.Water*3.5
	}

	db.Model(&utility).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": utility})
}

func DeleteUtility(c *gin.Context) {
	id := c.Param("id")
	var utility models.Utility
	db := config.GetDB()
	if err := db.First(&utility, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Utility record not found"})
		return
	}
	db.Delete(&utility)
	c.JSON(http.StatusOK, gin.H{"message": "Utility record deleted successfully"})
}

func GetUtilityStats(c *gin.Context) {
	month := c.Query("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	db := config.GetDB()
	var totalElectricity, totalWater, totalCost float64
	var count int64

	db.Model(&models.Utility{}).Where("month = ?", month).
		Select("IFNULL(SUM(electricity), 0), IFNULL(SUM(water), 0), IFNULL(SUM(total_cost), 0), COUNT(*)").
		Row().Scan(&totalElectricity, &totalWater, &totalCost, &count)

	var unpaidCount int64
	db.Model(&models.Utility{}).Where("month = ? AND status = ?", month, "unpaid").Count(&unpaidCount)

	c.JSON(http.StatusOK, gin.H{
		"month":           month,
		"total_electricity": totalElectricity,
		"total_water":     totalWater,
		"total_cost":      totalCost,
		"record_count":    count,
		"unpaid_count":    unpaidCount,
	})
}
