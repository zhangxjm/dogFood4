package main

import (
	"log"
	"fruit-store-backend/config"
	"fruit-store-backend/database"
	"fruit-store-backend/handlers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	cfg := config.LoadConfig()

	if err := database.InitDB(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	if err := database.SeedData(); err != nil {
		log.Printf("Warning: Failed to seed data: %v", err)
	}

	app := fiber.New(fiber.Config{
		AppName: "Fruit Store Backend",
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.AllowOrigins,
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	}))

	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"code":    200,
			"message": "OK",
			"data": fiber.Map{
				"name":    "Fruit Store Backend",
				"version": "1.0.0",
			},
		})
	})

	api := app.Group("/api")

	categories := api.Group("/categories")
	categories.Get("", handlers.GetCategories)
	categories.Get("/:id", handlers.GetCategory)
	categories.Post("", handlers.CreateCategory)
	categories.Put("/:id", handlers.UpdateCategory)
	categories.Delete("/:id", handlers.DeleteCategory)

	products := api.Group("/products")
	products.Get("", handlers.GetProducts)
	products.Get("/:id", handlers.GetProduct)
	products.Post("", handlers.CreateProduct)
	products.Put("/:id", handlers.UpdateProduct)
	products.Delete("/:id", handlers.DeleteProduct)

	log.Printf("Server starting on port %s", cfg.Port)
	if err := app.Listen(cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
