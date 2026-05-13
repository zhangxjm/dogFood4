package main

import (
	_ "visitor/routers"
	"visitor/models"

	beego "github.com/beego/beego/v2/server/web"
)

func main() {
	models.InitDB()
	beego.Run()
}
