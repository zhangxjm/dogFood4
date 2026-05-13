package controllers

import (
	"backend/database"
	"backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetParkingSpots(c *fiber.Ctx) error {
	var spots []models.ParkingSpot
	keyword := c.Query("keyword")
	available := c.Query("available")

	query := database.DB.Order("spot_number ASC")
	if keyword != "" {
		query = query.Where("spot_number LIKE ? OR location LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%")
	}
	if available == "true" {
		query = query.Where("owner_id IS NULL")
	} else if available == "false" {
		query = query.Where("owner_id IS NOT NULL")
	}

	if err := query.Find(&spots).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	for i := range spots {
		if spots[i].OwnerID != nil && *spots[i].OwnerID != "" {
			var owner models.Owner
			if err := database.DB.First(&owner, "id = ?", *spots[i].OwnerID).Error; err == nil {
				spots[i].Owner = &owner
			}
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  spots,
	})
}

func GetParkingSpot(c *fiber.Ctx) error {
	id := c.Params("id")
	var spot models.ParkingSpot

	if err := database.DB.First(&spot, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error":   true,
			"message": "Parking spot not found",
		})
	}

	if spot.OwnerID != nil && *spot.OwnerID != "" {
		var owner models.Owner
		if err := database.DB.First(&owner, "id = ?", *spot.OwnerID).Error; err == nil {
			spot.Owner = &owner
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  spot,
	})
}

func CreateParkingSpot(c *fiber.Ctx) error {
	var spot models.ParkingSpot
	if err := c.BodyParser(&spot); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	if spot.SpotNumber == "" {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Spot number is required",
		})
	}

	if err := database.DB.Create(&spot).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"error": false,
		"data":  spot,
	})
}

func UpdateParkingSpot(c *fiber.Ctx) error {
	id := c.Params("id")
	var spot models.ParkingSpot

	if err := database.DB.First(&spot, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error":   true,
			"message": "Parking spot not found",
		})
	}

	var updateData models.ParkingSpot
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	spot.SpotNumber = updateData.SpotNumber
	spot.Location = updateData.Location
	spot.OwnerID = updateData.OwnerID
	spot.Note = updateData.Note

	if err := database.DB.Save(&spot).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  spot,
	})
}

func DeleteParkingSpot(c *fiber.Ctx) error {
	id := c.Params("id")
	result := database.DB.Delete(&models.ParkingSpot{}, "id = ?", id)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": result.Error.Error(),
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error":   true,
			"message": "Parking spot not found",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Parking spot deleted successfully",
	})
}
