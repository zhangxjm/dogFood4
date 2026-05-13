package controllers

import (
	"backend/database"
	"backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetOwners(c *fiber.Ctx) error {
	var owners []models.Owner
	keyword := c.Query("keyword")

	query := database.DB.Order("created_at DESC")
	if keyword != "" {
		query = query.Where("name LIKE ? OR phone LIKE ? OR address LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if err := query.Find(&owners).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  owners,
	})
}

func GetOwner(c *fiber.Ctx) error {
	id := c.Params("id")
	var owner models.Owner

	if err := database.DB.Preload("Vehicles").Preload("ParkingSpot").First(&owner, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error":   true,
			"message": "Owner not found",
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  owner,
	})
}

func CreateOwner(c *fiber.Ctx) error {
	var owner models.Owner
	if err := c.BodyParser(&owner); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	if owner.Name == "" || owner.Phone == "" {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Name and phone are required",
		})
	}

	if err := database.DB.Create(&owner).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"error": false,
		"data":  owner,
	})
}

func UpdateOwner(c *fiber.Ctx) error {
	id := c.Params("id")
	var owner models.Owner

	if err := database.DB.First(&owner, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error":   true,
			"message": "Owner not found",
		})
	}

	var updateData models.Owner
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	owner.Name = updateData.Name
	owner.Phone = updateData.Phone
	owner.Address = updateData.Address
	owner.Note = updateData.Note

	if err := database.DB.Save(&owner).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  owner,
	})
}

func DeleteOwner(c *fiber.Ctx) error {
	id := c.Params("id")
	result := database.DB.Delete(&models.Owner{}, "id = ?", id)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": result.Error.Error(),
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error":   true,
			"message": "Owner not found",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Owner deleted successfully",
	})
}
