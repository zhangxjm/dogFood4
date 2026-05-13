package router

import (
	"iot-monitor/handlers"
	"iot-monitor/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(deviceHandler *handlers.DeviceHandler, hub *websocket.Hub) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		devices := api.Group("/devices")
		{
			devices.GET("", deviceHandler.GetAllDevices)
			devices.POST("", deviceHandler.CreateDevice)
			devices.GET("/:id", deviceHandler.GetDevice)
			devices.DELETE("/:id", deviceHandler.DeleteDevice)
			devices.GET("/:id/history", deviceHandler.GetSensorHistory)
		}

		groups := api.Group("/groups")
		{
			groups.GET("", deviceHandler.GetAllGroups)
			groups.POST("", deviceHandler.CreateGroup)
		}

		api.GET("/alerts", deviceHandler.GetRecentAlerts)
		api.GET("/statistics", deviceHandler.GetStatistics)
	}

	r.GET("/ws", func(c *gin.Context) {
		hub.ServeWs(c)
	})

	return r
}
