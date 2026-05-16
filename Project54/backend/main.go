package main

import (
	"pet-foster-backend/config"
	"pet-foster-backend/routes"
)

func main() {
	config.ConnectDatabase()
	r := routes.SetupRouter()
	r.Run(":8080")
}
