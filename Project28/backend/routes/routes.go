package routes

import (
	"petshop/controllers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		owners := api.Group("/owners")
		{
			owners.GET("", controllers.GetOwners)
			owners.POST("", controllers.CreateOwner)
			owners.GET("/:id", controllers.GetOwner)
			owners.PUT("/:id", controllers.UpdateOwner)
			owners.DELETE("/:id", controllers.DeleteOwner)
		}

		pets := api.Group("/pets")
		{
			pets.GET("", controllers.GetPets)
			pets.POST("", controllers.CreatePet)
			pets.GET("/search", controllers.SearchPets)
			pets.GET("/:id", controllers.GetPet)
			pets.PUT("/:id", controllers.UpdatePet)
			pets.DELETE("/:id", controllers.DeletePet)
		}

		vaccines := api.Group("/vaccines")
		{
			vaccines.GET("", controllers.GetVaccines)
			vaccines.POST("", controllers.CreateVaccine)
			vaccines.GET("/:id", controllers.GetVaccine)
			vaccines.PUT("/:id", controllers.UpdateVaccine)
			vaccines.DELETE("/:id", controllers.DeleteVaccine)
		}
	}

	return r
}
