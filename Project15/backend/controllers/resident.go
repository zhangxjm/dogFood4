package controllers

import (
	"dormitory/config"
	"dormitory/models"
	"encoding/csv"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetResidents(c *gin.Context) {
	var residents []models.Resident
	db := config.GetDB()
	db.Find(&residents)
	c.JSON(http.StatusOK, gin.H{"data": residents})
}

func CreateResident(c *gin.Context) {
	var input models.Resident
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	var existing models.Resident
	if db.Where("student_id = ?", input.StudentID).First(&existing).Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Student ID already exists"})
		return
	}

	if input.RoomID > 0 {
		var room models.Room
		if err := db.First(&room, input.RoomID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Room not found"})
			return
		}
		if room.CurrentNum >= room.Capacity {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Room is full"})
			return
		}
		db.Model(&room).Update("current_num", room.CurrentNum+1)
	}

	db.Create(&input)
	c.JSON(http.StatusCreated, gin.H{"data": input})
}

func UpdateResident(c *gin.Context) {
	id := c.Param("id")
	var resident models.Resident
	db := config.GetDB()
	if err := db.First(&resident, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Resident not found"})
		return
	}

	oldRoomID := resident.RoomID

	var input models.Resident
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.RoomID != oldRoomID {
		if oldRoomID > 0 {
			var oldRoom models.Room
			if db.First(&oldRoom, oldRoomID).Error == nil {
				db.Model(&oldRoom).Update("current_num", oldRoom.CurrentNum-1)
			}
		}
		if input.RoomID > 0 {
			var newRoom models.Room
			if err := db.First(&newRoom, input.RoomID).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Room not found"})
				return
			}
			if newRoom.CurrentNum >= newRoom.Capacity {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Room is full"})
				return
			}
			db.Model(&newRoom).Update("current_num", newRoom.CurrentNum+1)
		}
	}

	db.Model(&resident).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": resident})
}

func DeleteResident(c *gin.Context) {
	id := c.Param("id")
	var resident models.Resident
	db := config.GetDB()
	if err := db.First(&resident, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Resident not found"})
		return
	}

	if resident.RoomID > 0 {
		var room models.Room
		if db.First(&room, resident.RoomID).Error == nil {
			db.Model(&room).Update("current_num", room.CurrentNum-1)
		}
	}

	db.Delete(&resident)
	c.JSON(http.StatusOK, gin.H{"message": "Resident deleted successfully"})
}

func ExportResidentsCSV(c *gin.Context) {
	var residents []models.Resident
	db := config.GetDB()
	db.Find(&residents)

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", "attachment; filename=residents.csv")
	c.Header("Content-Type", "text/csv; charset=utf-8")

	writer := csv.NewWriter(c.Writer)
	writer.Write([]string{"ID", "姓名", "学号", "专业", "性别", "电话", "入住时间"})
	for _, r := range residents {
		var checkIn string
		if r.CheckInAt != nil {
			checkIn = r.CheckInAt.Format("2006-01-02")
		}
		writer.Write([]string{
			strconv.FormatUint(uint64(r.ID), 10),
			r.Name,
			r.StudentID,
			r.Major,
			r.Gender,
			r.Phone,
			checkIn,
		})
	}
	writer.Flush()
}
