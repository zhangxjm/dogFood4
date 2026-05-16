package controllers

import (
	"net/http"
	"pet-foster-backend/config"
	"pet-foster-backend/models"

	"github.com/gin-gonic/gin"
)

func GetPackages(c *gin.Context) {
	var packages []models.Package
	config.DB.Find(&packages)
	c.JSON(http.StatusOK, gin.H{"data": packages})
}

func GetPackage(c *gin.Context) {
	var pkg models.Package
	if err := config.DB.Where("id = ?", c.Param("id")).First(&pkg).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Package not found!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pkg})
}

func CreatePackage(c *gin.Context) {
	var input models.Package
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	pkg := models.Package{
		Name:         input.Name,
		Description:  input.Description,
		Price:        input.Price,
		DurationDays: input.DurationDays,
	}
	config.DB.Create(&pkg)
	c.JSON(http.StatusOK, gin.H{"data": pkg})
}

func UpdatePackage(c *gin.Context) {
	var pkg models.Package
	if err := config.DB.Where("id = ?", c.Param("id")).First(&pkg).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Package not found!"})
		return
	}
	var input models.Package
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Model(&pkg).Updates(input)
	c.JSON(http.StatusOK, gin.H{"data": pkg})
}

func DeletePackage(c *gin.Context) {
	var pkg models.Package
	if err := config.DB.Where("id = ?", c.Param("id")).First(&pkg).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Package not found!"})
		return
	}
	config.DB.Delete(&pkg)
	c.JSON(http.StatusOK, gin.H{"data": true})
}
