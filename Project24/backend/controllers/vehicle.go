package controllers

import (
	"backend/database"
	"backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetVehicles(c *fiber.Ctx) error {
	var vehicles []models.Vehicle
	keyword := c.Query("keyword")
	ownerID := c.Query("owner_id")

	query := database.DB.Order("created_at DESC")
	if keyword != "" {
		query = query.Where("plate_number LIKE ? OR brand LIKE ? OR model LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	if ownerID != "" {
		query = query.Where("owner_id = ?", ownerID)
	}

	if err := query.Find(&vehicles).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	for i := range vehicles {
		if vehicles[i].OwnerID != "" {
			var owner models.Owner
			if err := database.DB.First(&owner, "id = ?", vehicles[i].OwnerID).Error; err == nil {
				vehicles[i].Owner = &owner
			}
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  vehicles,
	})
}

func GetVehicle(c *fiber.Ctx) error {
	id := c.Params("id")
	var vehicle models.Vehicle

	if err := database.DB.First(&vehicle, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error":   true,
			"message": "Vehicle not found",
		})
	}

	if vehicle.OwnerID != "" {
		var owner models.Owner
		if err := database.DB.First(&owner, "id = ?", vehicle.OwnerID).Error; err == nil {
			vehicle.Owner = &owner
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  vehicle,
	})
}

func CreateVehicle(c *fiber.Ctx) error {
	var vehicle models.Vehicle
	if err := c.BodyParser(&vehicle); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	if vehicle.PlateNumber == "" {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Plate number is required",
		})
	}

	if err := database.DB.Create(&vehicle).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"error": false,
		"data":  vehicle,
	})
}

func UpdateVehicle(c *fiber.Ctx) error {
	id := c.Params("id")
	var vehicle models.Vehicle

	if err := database.DB.First(&vehicle, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error":   true,
			"message": "Vehicle not found",
		})
	}

	var updateData models.Vehicle
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	vehicle.PlateNumber = updateData.PlateNumber
	vehicle.OwnerID = updateData.OwnerID
	vehicle.VehicleType = updateData.VehicleType
	vehicle.Color = updateData.Color
	vehicle.Brand = updateData.Brand
	vehicle.Model = updateData.Model
	vehicle.Note = updateData.Note

	if err := database.DB.Save(&vehicle).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  vehicle,
	})
}

func DeleteVehicle(c *fiber.Ctx) error {
	id := c.Params("id")
	result := database.DB.Delete(&models.Vehicle{}, "id = ?", id)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": result.Error.Error(),
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error":   true,
			"message": "Vehicle not found",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Vehicle deleted successfully",
	})
}

func SearchVehicleByPlate(c *fiber.Ctx) error {
	plate := c.Query("plate")
	if plate == "" {
		return c.Status(400).JSON(fiber.Map{
			"error":   true,
			"message": "Plate number is required",
		})
	}

	var vehicles []models.Vehicle
	if err := database.DB.Where("plate_number LIKE ?", "%"+plate+"%").Find(&vehicles).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	for i := range vehicles {
		if vehicles[i].OwnerID != "" {
			var owner models.Owner
			if err := database.DB.First(&owner, "id = ?", vehicles[i].OwnerID).Error; err == nil {
				vehicles[i].Owner = &owner
			}
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  vehicles,
	})
}
