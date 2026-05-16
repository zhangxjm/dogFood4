package controllers

import (
	"library-system/database"
	"library-system/models"

	"github.com/gofiber/fiber/v2"
)

func GetBooks(c *fiber.Ctx) error {
	var books []models.Book
	database.DB.Find(&books)
	return c.JSON(fiber.Map{"data": books})
}

func GetBook(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" || id == "undefined" {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid book ID"})
	}
	var book models.Book
	result := database.DB.First(&book, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Book not found"})
	}
	return c.JSON(book)
}

func CreateBook(c *fiber.Ctx) error {
	book := new(models.Book)
	if err := c.BodyParser(book); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	if book.Available == 0 {
		book.Available = book.Quantity
	}
	result := database.DB.Create(&book)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": result.Error.Error()})
	}
	return c.JSON(fiber.Map{"message": "Book created successfully", "data": book})
}

func UpdateBook(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" || id == "undefined" {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid book ID"})
	}
	var book models.Book
	result := database.DB.First(&book, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Book not found"})
	}
	if err := c.BodyParser(&book); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	database.DB.Save(&book)
	return c.JSON(fiber.Map{"message": "Book updated successfully", "data": book})
}

func DeleteBook(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" || id == "undefined" {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid book ID"})
	}
	var book models.Book
	result := database.DB.First(&book, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Book not found"})
	}
	database.DB.Delete(&book)
	return c.JSON(fiber.Map{"message": "Book deleted successfully"})
}
