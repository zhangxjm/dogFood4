package main

import (
	"log"
	"warehouse-management/config"
	"warehouse-management/models"
	"warehouse-management/routes"
	"warehouse-management/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()

	models.InitDB()

	utils.InitScheduler()

	r := gin.Default()

	routes.SetupRoutes(r)

	log.Printf("Server starting on port %s...", config.AppConfig.Server.Port)
	if err := r.Run(":" + config.AppConfig.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
