package main

import (
	"dormitory/config"
	"dormitory/models"
	"dormitory/routes"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	config.InitDB()
	db := config.GetDB()
	db.AutoMigrate(&models.Room{}, &models.Utility{}, &models.Resident{})

	r := gin.Default()

	routes.SetupRoutes(r)

	log.Println("Server starting on port 8080...")
	r.Run(":8080")
}
