package main

import (
	"iot-monitor/config"
	"iot-monitor/handlers"
	"iot-monitor/repositories"
	"iot-monitor/router"
	"iot-monitor/services"
	"iot-monitor/websocket"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		if !os.IsNotExist(err) {
			log.Printf("Warning: %v", err)
		}
	}

	cfg := config.Load()

	repo := repositories.NewRedisRepository(cfg)
	for i := 0; i < 30; i++ {
		if err := repo.Ping(); err == nil {
			log.Println("Redis connected successfully")
			break
		} else {
			log.Printf("Waiting for Redis... attempt %d", i+1)
			time.Sleep(2 * time.Second)
		}
		if i == 29 {
			log.Fatal("Failed to connect to Redis")
		}
	}

	deviceService := services.NewDeviceService(repo)
	deviceHandler := handlers.NewDeviceHandler(deviceService)

	hub := websocket.NewHub()
	go hub.Run()

	simulator := services.NewSimulator(deviceService, hub)
	if err := simulator.InitializeDemoData(); err != nil {
		log.Fatalf("Failed to initialize demo data: %v", err)
	}
	log.Println("Demo data initialized")

	go simulator.Start(2 * time.Second)

	r := router.SetupRouter(deviceHandler, hub)

	log.Printf("Server starting on port %s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
