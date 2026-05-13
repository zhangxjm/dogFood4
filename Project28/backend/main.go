package main

import (
	"petshop/config"
	"petshop/models"
	"petshop/routes"
)

func main() {
	config.InitDB()
	models.Migrate()

	r := routes.SetupRouter()
	r.Run(":8080")
}
