package controllers

import (
	"net/http"
	"pet-foster-backend/config"
	"pet-foster-backend/models"

	"github.com/gin-gonic/gin"
)

func GetReviews(c *gin.Context) {
	var reviews []models.Review
	config.DB.Preload("Reservation.Pet").Preload("Reservation.Package").Find(&reviews)
	c.JSON(http.StatusOK, gin.H{"data": reviews})
}

func GetReview(c *gin.Context) {
	var review models.Review
	if err := config.DB.Preload("Reservation.Pet").Preload("Reservation.Package").Where("id = ?", c.Param("id")).First(&review).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Review not found!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": review})
}

func CreateReview(c *gin.Context) {
	var input struct {
		ReservationID uint   `json:"reservation_id" binding:"required"`
		Rating        int    `json:"rating" binding:"required,min=1,max=5"`
		Comment       string `json:"comment"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var reservation models.Reservation
	if err := config.DB.Where("id = ?", input.ReservationID).First(&reservation).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reservation not found!"})
		return
	}

	if reservation.Status != "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Can only review completed reservations!"})
		return
	}

	var existingReview models.Review
	if config.DB.Where("reservation_id = ?", input.ReservationID).First(&existingReview).Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This reservation already has a review!"})
		return
	}

	review := models.Review{
		ReservationID: input.ReservationID,
		Rating:        input.Rating,
		Comment:       input.Comment,
	}
	config.DB.Create(&review)
	config.DB.Preload("Reservation.Pet").Preload("Reservation.Package").First(&review, review.ID)
	c.JSON(http.StatusOK, gin.H{"data": review})
}

func UpdateReview(c *gin.Context) {
	var review models.Review
	if err := config.DB.Where("id = ?", c.Param("id")).First(&review).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Review not found!"})
		return
	}

	var input struct {
		Rating  int    `json:"rating" binding:"min=1,max=5"`
		Comment string `json:"comment"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Model(&review).Updates(input)
	config.DB.Preload("Reservation.Pet").Preload("Reservation.Package").First(&review, review.ID)
	c.JSON(http.StatusOK, gin.H{"data": review})
}

func DeleteReview(c *gin.Context) {
	var review models.Review
	if err := config.DB.Where("id = ?", c.Param("id")).First(&review).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Review not found!"})
		return
	}
	config.DB.Delete(&review)
	c.JSON(http.StatusOK, gin.H{"data": true})
}
