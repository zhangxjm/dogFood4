package controllers

import (
	"library-system/database"
	"library-system/models"

	"github.com/gofiber/fiber/v2"
)

func GetReaders(c *fiber.Ctx) error {
	var readers []models.Reader
	database.DB.Find(&readers)
	return c.JSON(fiber.Map{"data": readers})
}

func GetReader(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" || id == "undefined" {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid reader ID"})
	}
	var reader models.Reader
	result := database.DB.First(&reader, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Reader not found"})
	}
	return c.JSON(reader)
}

func CreateReader(c *fiber.Ctx) error {
	reader := new(models.Reader)
	if err := c.BodyParser(reader); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	result := database.DB.Create(&reader)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	return c.JSON(fiber.Map{"message": "Reader created successfully", "data": reader})
}

func UpdateReader(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" || id == "undefined" {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid reader ID"})
	}
	var reader models.Reader
	result := database.DB.First(&reader, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Reader not found"})
	}
	if err := c.BodyParser(&reader); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	database.DB.Save(&reader)
	return c.JSON(fiber.Map{"message": "Reader updated successfully", "data": reader})
}

func DeleteReader(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" || id == "undefined" {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid reader ID"})
	}
	var reader models.Reader
	result := database.DB.First(&reader, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Reader not found"})
	}
	database.DB.Delete(&reader)
	return c.JSON(fiber.Map{"message": "Reader deleted successfully"})
}
