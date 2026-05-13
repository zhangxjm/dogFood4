package routes

import (
	"dormitory/controllers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		rooms := api.Group("/rooms")
		{
			rooms.GET("", controllers.GetRooms)
			rooms.GET("/:id", controllers.GetRoom)
			rooms.POST("", controllers.CreateRoom)
			rooms.PUT("/:id", controllers.UpdateRoom)
			rooms.DELETE("/:id", controllers.DeleteRoom)
			rooms.GET("/:id/residents", controllers.GetRoomResidents)
		}

		residents := api.Group("/residents")
		{
			residents.GET("", controllers.GetResidents)
			residents.POST("", controllers.CreateResident)
			residents.PUT("/:id", controllers.UpdateResident)
			residents.DELETE("/:id", controllers.DeleteResident)
			residents.GET("/export/csv", controllers.ExportResidentsCSV)
		}

		utilities := api.Group("/utilities")
		{
			utilities.GET("", controllers.GetUtilities)
			utilities.POST("", controllers.CreateUtility)
			utilities.PUT("/:id", controllers.UpdateUtility)
			utilities.DELETE("/:id", controllers.DeleteUtility)
			utilities.GET("/stats", controllers.GetUtilityStats)
		}
	}
}
