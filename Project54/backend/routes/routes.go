package routes

import (
	"pet-foster-backend/controllers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json; charset=utf-8")
		c.Next()
	})

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		packages := api.Group("/packages")
		{
			packages.GET("", controllers.GetPackages)
			packages.GET("/:id", controllers.GetPackage)
			packages.POST("", controllers.CreatePackage)
			packages.PUT("/:id", controllers.UpdatePackage)
			packages.DELETE("/:id", controllers.DeletePackage)
		}

		pets := api.Group("/pets")
		{
			pets.GET("", controllers.GetPets)
			pets.GET("/:id", controllers.GetPet)
			pets.POST("", controllers.CreatePet)
			pets.PUT("/:id", controllers.UpdatePet)
			pets.DELETE("/:id", controllers.DeletePet)
		}

		reservations := api.Group("/reservations")
		{
			reservations.GET("", controllers.GetReservations)
			reservations.GET("/:id", controllers.GetReservation)
			reservations.POST("", controllers.CreateReservation)
			reservations.PUT("/:id", controllers.UpdateReservation)
			reservations.PUT("/:id/status", controllers.UpdateReservationStatus)
			reservations.DELETE("/:id", controllers.DeleteReservation)
			reservations.POST("/check-availability", controllers.CheckAvailability)
		}

		reviews := api.Group("/reviews")
		{
			reviews.GET("", controllers.GetReviews)
			reviews.GET("/:id", controllers.GetReview)
			reviews.POST("", controllers.CreateReview)
			reviews.PUT("/:id", controllers.UpdateReview)
			reviews.DELETE("/:id", controllers.DeleteReview)
		}

		api.GET("/statistics", controllers.GetStatistics)
	}

	return r
}
