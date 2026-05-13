package controllers

import (
	"dormitory/config"
	"dormitory/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetRooms(c *gin.Context) {
	var rooms []models.Room
	db := config.GetDB()
	db.Find(&rooms)
	c.JSON(http.StatusOK, gin.H{"data": rooms})
}

func GetRoom(c *gin.Context) {
	id := c.Param("id")
	var room models.Room
	db := config.GetDB()
	if err := db.First(&room, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": room})
}

func CreateRoom(c *gin.Context) {
	var input models.Room
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	var existing models.Room
	if db.Where("room_number = ?", input.RoomNumber).First(&existing).Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room number already exists"})
		return
	}

	db.Create(&input)
	c.JSON(http.StatusCreated, gin.H{"data": input})
}

func UpdateRoom(c *gin.Context) {
	id := c.Param("id")
	var room models.Room
	db := config.GetDB()
	if err := db.First(&room, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	var input models.Room
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Model(&room).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": room})
}

func DeleteRoom(c *gin.Context) {
	id := c.Param("id")
	var room models.Room
	db := config.GetDB()
	if err := db.First(&room, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}
	db.Delete(&room)
	c.JSON(http.StatusOK, gin.H{"message": "Room deleted successfully"})
}

func GetRoomResidents(c *gin.Context) {
	roomID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID"})
		return
	}

	var residents []models.Resident
	db := config.GetDB()
	db.Where("room_id = ?", roomID).Find(&residents)
	c.JSON(http.StatusOK, gin.H{"data": residents})
}
