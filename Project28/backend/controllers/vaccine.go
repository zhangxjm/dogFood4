package controllers

import (
	"net/http"
	"petshop/config"
	"petshop/models"

	"github.com/gin-gonic/gin"
)

func GetVaccines(c *gin.Context) {
	petID := c.Query("pet_id")
	var vaccines []models.Vaccine
	
	query := config.DB
	if petID != "" {
		query = query.Where("pet_id = ?", petID)
	}
	query.Find(&vaccines)
	c.JSON(http.StatusOK, gin.H{"data": vaccines})
}

func CreateVaccine(c *gin.Context) {
	var input models.Vaccine
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	vaccine := models.Vaccine{
		PetID:       input.PetID,
		Name:        input.Name,
		VaccineDate: input.VaccineDate,
		Description: input.Description,
	}
	config.DB.Create(&vaccine)
	c.JSON(http.StatusOK, gin.H{"data": vaccine})
}

func GetVaccine(c *gin.Context) {
	var vaccine models.Vaccine
	if err := config.DB.Where("id = ?", c.Param("id")).First(&vaccine).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": vaccine})
}

func UpdateVaccine(c *gin.Context) {
	var vaccine models.Vaccine
	if err := config.DB.Where("id = ?", c.Param("id")).First(&vaccine).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}

	var input models.Vaccine
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Model(&vaccine).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": vaccine})
}

func DeleteVaccine(c *gin.Context) {
	var vaccine models.Vaccine
	if err := config.DB.Where("id = ?", c.Param("id")).First(&vaccine).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}

	config.DB.Delete(&vaccine)
	c.JSON(http.StatusOK, gin.H{"data": true})
}
