package main

import (
	_ "campus-job/routers"
	_ "campus-job/models"

	"github.com/beego/beego/v2/server/web"
)

func main() {
	web.Run()
}
