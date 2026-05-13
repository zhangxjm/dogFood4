package main

import (
	"charging-station-backend/config"
	"charging-station-backend/database"
	"charging-station-backend/handlers"
	"charging-station-backend/simulator"
	"charging-station-backend/websocket"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := database.InitMySQL(); err != nil {
		log.Fatalf("Failed to init MySQL: %v", err)
	}

	if err := database.InitRedis(); err != nil {
		log.Fatalf("Failed to init Redis: %v", err)
	}
	defer database.Close()

	websocket.StartHub()

	simulator.Start()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.GET("/stations", handlers.GetStations)
		api.GET("/stations/:id", handlers.GetStation)
		api.GET("/stations/stats", handlers.GetStationStats)
		api.GET("/power/history", handlers.GetPowerHistory)
		api.POST("/stations/:id/control", handlers.SendControl)
		api.POST("/stations/:id/start", handlers.StartCharging)
		api.POST("/stations/:id/stop", handlers.StopCharging)
		api.POST("/stations/:id/reset", handlers.ResetStation)

		api.POST("/orders", handlers.CreateOrder)
		api.GET("/orders", handlers.GetOrders)
		api.GET("/orders/:id", handlers.GetOrder)
		api.POST("/orders/:id/end", handlers.EndOrder)
		api.GET("/revenue/stats", handlers.GetRevenueStats)

		api.GET("/alarms", handlers.GetAlarms)
		api.POST("/alarms/:id/ack", handlers.AcknowledgeAlarm)
		api.POST("/alarms/:id/resolve", handlers.ResolveAlarm)
		api.GET("/alarms/stats", handlers.GetAlarmStats)
	}

	r.GET("/ws/device", websocket.ServeDeviceWS)
	r.GET("/ws/user", websocket.ServeUserWS)

	addr := config.AppConfig.Server.Host + ":" + config.AppConfig.Server.Port
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
