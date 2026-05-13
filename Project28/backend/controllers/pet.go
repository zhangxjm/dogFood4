package controllers

import (
	"net/http"
	"petshop/config"
	"petshop/models"

	"github.com/gin-gonic/gin"
)

func GetPets(c *gin.Context) {
	var pets []models.Pet
	config.DB.Preload("Owner").Preload("Vaccines").Find(&pets)
	c.JSON(http.StatusOK, gin.H{"data": pets})
}

func CreatePet(c *gin.Context) {
	var input models.Pet
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pet := models.Pet{
		Name:        input.Name,
		Type:        input.Type,
		Breed:       input.Breed,
		Gender:      input.Gender,
		BirthDate:   input.BirthDate,
		OwnerID:     input.OwnerID,
		Description: input.Description,
	}
	config.DB.Create(&pet)
	config.DB.Preload("Owner").Preload("Vaccines").First(&pet, pet.ID)
	c.JSON(http.StatusOK, gin.H{"data": pet})
}

func GetPet(c *gin.Context) {
	var pet models.Pet
	if err := config.DB.Preload("Owner").Preload("Vaccines").Where("id = ?", c.Param("id")).First(&pet).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pet})
}

func UpdatePet(c *gin.Context) {
	var pet models.Pet
	if err := config.DB.Where("id = ?", c.Param("id")).First(&pet).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}

	var input models.Pet
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Model(&pet).Updates(input)
	config.DB.Preload("Owner").Preload("Vaccines").First(&pet, pet.ID)
	c.JSON(http.StatusOK, gin.H{"data": pet})
}

func DeletePet(c *gin.Context) {
	var pet models.Pet
	if err := config.DB.Where("id = ?", c.Param("id")).First(&pet).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}

	config.DB.Delete(&pet)
	c.JSON(http.StatusOK, gin.H{"data": true})
}

func SearchPets(c *gin.Context) {
	keyword := c.Query("keyword")
	var pets []models.Pet
	
	query := config.DB.Preload("Owner").Preload("Vaccines")
	if keyword != "" {
		query = query.Joins("JOIN owners ON owners.id = pets.owner_id").
			Where("pets.name LIKE ? OR pets.breed LIKE ? OR owners.name LIKE ?",
				"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	query.Find(&pets)
	c.JSON(http.StatusOK, gin.H{"data": pets})
}
