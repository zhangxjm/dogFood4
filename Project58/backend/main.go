package main

import (
	"log"
	"project58/backend/controllers"
	"project58/backend/utils"

	"github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/filter/cors"
)

func main() {
	err := utils.InitDB()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	web.BConfig.CopyRequestBody = true

	web.InsertFilter("*", web.BeforeRouter, cors.Allow(&cors.Options{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	web.Router("/auth/login", &controllers.AuthController{}, "post:Login")
	web.Router("/auth/userinfo", &controllers.AuthController{}, "get:UserInfo")

	web.Router("/categories", &controllers.CategoryController{}, "get:List;post:Create")
	web.Router("/categories/:id", &controllers.CategoryController{}, "get:Get;put:Update;delete:Delete")

	web.Router("/supplies", &controllers.SupplyController{}, "get:List;post:Create")
	web.Router("/supplies/:id", &controllers.SupplyController{}, "get:Get;put:Update;delete:Delete")
	web.Router("/supplies/:id/stock-in", &controllers.SupplyController{}, "post:StockIn")

	web.Router("/applications", &controllers.ApplicationController{}, "get:List;post:Create")
	web.Router("/applications/pending", &controllers.ApplicationController{}, "get:PendingList")
	web.Router("/applications/:id", &controllers.ApplicationController{}, "get:Get;delete:Delete")
	web.Router("/applications/:id/approve", &controllers.ApplicationController{}, "post:Approve")
	web.Router("/applications/:id/reject", &controllers.ApplicationController{}, "post:Reject")
	web.Router("/applications/:id/receive", &controllers.ApplicationController{}, "post:Receive")

	web.Router("/stats/dashboard", &controllers.StatsController{}, "get:Dashboard")

	web.Router("/stock-records", &controllers.StockRecordController{}, "get:List")

	web.Run(":3001")
}
