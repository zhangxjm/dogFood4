package routes

import (
	"library-system/controllers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Use(func(c *fiber.Ctx) error {
		c.Set("Access-Control-Allow-Origin", "*")
		c.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Method() == "OPTIONS" {
			return c.SendStatus(200)
		}
		return c.Next()
	})

	books := api.Group("/books")
	books.Get("/", controllers.GetBooks)
	books.Get("/:id", controllers.GetBook)
	books.Post("/", controllers.CreateBook)
	books.Put("/:id", controllers.UpdateBook)
	books.Delete("/:id", controllers.DeleteBook)

	readers := api.Group("/readers")
	readers.Get("/", controllers.GetReaders)
	readers.Get("/:id", controllers.GetReader)
	readers.Post("/", controllers.CreateReader)
	readers.Put("/:id", controllers.UpdateReader)
	readers.Delete("/:id", controllers.DeleteReader)

	borrows := api.Group("/borrows")
	borrows.Get("/", controllers.GetBorrowRecords)
	borrows.Post("/", controllers.CreateBorrow)
	borrows.Post("/return", controllers.ReturnBook)
	borrows.Post("/:id/pay-fine", controllers.PayFine)

	api.Get("/statistics", controllers.GetStatistics)
}
