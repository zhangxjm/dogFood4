package controllers

import (
	"net/http"
	"pet-foster-backend/config"
	"pet-foster-backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

func checkTimeConflict(petID uint, startDate, endDate string, excludeID ...uint) bool {
	var count int
	query := config.DB.Model(&models.Reservation{}).
		Where("pet_id = ? AND status != ?", petID, "cancelled").
		Where("(start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?) OR (start_date >= ? AND end_date <= ?)",
			endDate, startDate, endDate, startDate, startDate, endDate)
	
	if len(excludeID) > 0 {
		query = query.Where("id != ?", excludeID[0])
	}
	
	query.Count(&count)
	return count > 0
}

func calculateTotalPrice(packageID uint, startDate, endDate string) (float64, error) {
	var pkg models.Package
	if err := config.DB.Where("id = ?", packageID).First(&pkg).Error; err != nil {
		return 0, err
	}

	start, _ := time.Parse("2006-01-02", startDate)
	end, _ := time.Parse("2006-01-02", endDate)
	days := int(end.Sub(start).Hours()/24) + 1

	return pkg.Price * float64(days), nil
}

func GetReservations(c *gin.Context) {
	var reservations []models.Reservation
	config.DB.Preload("Pet").Preload("Package").Find(&reservations)
	c.JSON(http.StatusOK, gin.H{"data": reservations})
}

func GetReservation(c *gin.Context) {
	var reservation models.Reservation
	if err := config.DB.Preload("Pet").Preload("Package").Where("id = ?", c.Param("id")).First(&reservation).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reservation not found!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": reservation})
}

func CreateReservation(c *gin.Context) {
	var input models.Reservation
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if checkTimeConflict(input.PetID, input.StartDate, input.EndDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Time conflict! This pet already has a reservation for the selected dates."})
		return
	}

	totalPrice, err := calculateTotalPrice(input.PackageID, input.StartDate, input.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid package!"})
		return
	}

	reservation := models.Reservation{
		PetID:           input.PetID,
		PackageID:       input.PackageID,
		StartDate:       input.StartDate,
		EndDate:         input.EndDate,
		Status:          "pending",
		SpecialRequests: input.SpecialRequests,
		TotalPrice:      totalPrice,
	}
	config.DB.Create(&reservation)
	config.DB.Preload("Pet").Preload("Package").First(&reservation, reservation.ID)
	c.JSON(http.StatusOK, gin.H{"data": reservation})
}

func UpdateReservation(c *gin.Context) {
	var reservation models.Reservation
	if err := config.DB.Where("id = ?", c.Param("id")).First(&reservation).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reservation not found!"})
		return
	}

	var input models.Reservation
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.StartDate != "" && input.EndDate != "" {
		if checkTimeConflict(reservation.PetID, input.StartDate, input.EndDate, reservation.ID) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Time conflict! This pet already has a reservation for the selected dates."})
			return
		}
	}

	totalPrice, err := calculateTotalPrice(input.PackageID, input.StartDate, input.EndDate)
	if err == nil {
		input.TotalPrice = totalPrice
	}

	config.DB.Model(&reservation).Updates(input)
	config.DB.Preload("Pet").Preload("Package").First(&reservation, reservation.ID)
	c.JSON(http.StatusOK, gin.H{"data": reservation})
}

func UpdateReservationStatus(c *gin.Context) {
	var reservation models.Reservation
	if err := config.DB.Where("id = ?", c.Param("id")).First(&reservation).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reservation not found!"})
		return
	}

	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validStatuses := map[string]bool{
		"pending":     true,
		"confirmed":   true,
		"in_progress": true,
		"completed":   true,
		"cancelled":   true,
	}

	if !validStatuses[input.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status!"})
		return
	}

	config.DB.Model(&reservation).Update("status", input.Status)
	config.DB.Preload("Pet").Preload("Package").First(&reservation, reservation.ID)
	c.JSON(http.StatusOK, gin.H{"data": reservation})
}

func DeleteReservation(c *gin.Context) {
	var reservation models.Reservation
	if err := config.DB.Where("id = ?", c.Param("id")).First(&reservation).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reservation not found!"})
		return
	}
	config.DB.Delete(&reservation)
	c.JSON(http.StatusOK, gin.H{"data": true})
}

func CheckAvailability(c *gin.Context) {
	var input struct {
		PetID     uint   `json:"petId" binding:"required"`
		StartDate string `json:"startDate" binding:"required"`
		EndDate   string `json:"endDate" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	conflict := checkTimeConflict(input.PetID, input.StartDate, input.EndDate)
	c.JSON(http.StatusOK, gin.H{"available": !conflict})
}
