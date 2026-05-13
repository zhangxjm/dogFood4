package routes

import (
	"backend/controllers"

	"github.com/gofiber/fiber/v2"
)

func SetupOwnerRoutes(api fiber.Router) {
	owners := api.Group("/owners")
	owners.Get("/", controllers.GetOwners)
	owners.Get("/:id", controllers.GetOwner)
	owners.Post("/", controllers.CreateOwner)
	owners.Put("/:id", controllers.UpdateOwner)
	owners.Delete("/:id", controllers.DeleteOwner)
}

func SetupVehicleRoutes(api fiber.Router) {
	vehicles := api.Group("/vehicles")
	vehicles.Get("/", controllers.GetVehicles)
	vehicles.Get("/search", controllers.SearchVehicleByPlate)
	vehicles.Get("/:id", controllers.GetVehicle)
	vehicles.Post("/", controllers.CreateVehicle)
	vehicles.Put("/:id", controllers.UpdateVehicle)
	vehicles.Delete("/:id", controllers.DeleteVehicle)
}

func SetupParkingSpotRoutes(api fiber.Router) {
	spots := api.Group("/parking-spots")
	spots.Get("/", controllers.GetParkingSpots)
	spots.Get("/:id", controllers.GetParkingSpot)
	spots.Post("/", controllers.CreateParkingSpot)
	spots.Put("/:id", controllers.UpdateParkingSpot)
	spots.Delete("/:id", controllers.DeleteParkingSpot)
}
