package controllers

import (
	"net/http"
	"petshop/config"
	"petshop/models"

	"github.com/gin-gonic/gin"
)

func GetOwners(c *gin.Context) {
	var owners []models.Owner
	config.DB.Find(&owners)
	c.JSON(http.StatusOK, gin.H{"data": owners})
}

func CreateOwner(c *gin.Context) {
	var input models.Owner
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	owner := models.Owner{
		Name:        input.Name,
		Phone:       input.Phone,
		Address:     input.Address,
		Description: input.Description,
	}
	config.DB.Create(&owner)
	c.JSON(http.StatusOK, gin.H{"data": owner})
}

func GetOwner(c *gin.Context) {
	var owner models.Owner
	if err := config.DB.Where("id = ?", c.Param("id")).First(&owner).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": owner})
}

func UpdateOwner(c *gin.Context) {
	var owner models.Owner
	if err := config.DB.Where("id = ?", c.Param("id")).First(&owner).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}

	var input models.Owner
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Model(&owner).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": owner})
}

func DeleteOwner(c *gin.Context) {
	var owner models.Owner
	if err := config.DB.Where("id = ?", c.Param("id")).First(&owner).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}

	config.DB.Delete(&owner)
	c.JSON(http.StatusOK, gin.H{"data": true})
}
