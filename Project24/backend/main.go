package main

import (
	"backend/config"
	"backend/database"
	"backend/models"
	"backend/routes"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	if err := config.LoadEnv(); err != nil {
		log.Printf("Warning: %v", err)
	}

	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	if err := database.DB.AutoMigrate(&models.Owner{}, &models.Vehicle{}, &models.ParkingSpot{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	app := fiber.New(fiber.Config{
		AppName:      "Parking Management System",
		ErrorHandler: customErrorHandler,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin,Content-Type,Accept",
	}))

	app.Use(logger.New())

	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Service is running",
		})
	})

	api := app.Group("/api")
	routes.SetupOwnerRoutes(api)
	routes.SetupVehicleRoutes(api)
	routes.SetupParkingSpotRoutes(api)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}
	return c.Status(code).JSON(fiber.Map{
		"error":   true,
		"message": err.Error(),
	})
}
