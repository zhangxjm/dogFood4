package controllers

import (
	"net/http"
	"pet-foster-backend/config"
	"pet-foster-backend/models"

	"github.com/gin-gonic/gin"
)

func GetPets(c *gin.Context) {
	var pets []models.Pet
	config.DB.Find(&pets)
	c.JSON(http.StatusOK, gin.H{"data": pets})
}

func GetPet(c *gin.Context) {
	var pet models.Pet
	if err := config.DB.Where("id = ?", c.Param("id")).First(&pet).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pet not found!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pet})
}

func CreatePet(c *gin.Context) {
	var input models.Pet
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	pet := models.Pet{
		OwnerName:  input.OwnerName,
		OwnerPhone: input.OwnerPhone,
		PetName:    input.PetName,
		PetType:    input.PetType,
		Breed:      input.Breed,
		Age:        input.Age,
		Weight:     input.Weight,
		HealthInfo: input.HealthInfo,
	}
	config.DB.Create(&pet)
	c.JSON(http.StatusOK, gin.H{"data": pet})
}

func UpdatePet(c *gin.Context) {
	var pet models.Pet
	if err := config.DB.Where("id = ?", c.Param("id")).First(&pet).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pet not found!"})
		return
	}
	var input models.Pet
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Model(&pet).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": pet})
}

func DeletePet(c *gin.Context) {
	var pet models.Pet
	if err := config.DB.Where("id = ?", c.Param("id")).First(&pet).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pet not found!"})
		return
	}
	config.DB.Delete(&pet)
	c.JSON(http.StatusOK, gin.H{"data": true})
}
