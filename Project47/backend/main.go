package main

import (
	_ "driving-school/routers"
	"fmt"

	"github.com/beego/beego/v2/server/web"
)

func main() {
	fmt.Println("Driving School Management System Starting...")
	fmt.Println("Server running on http://localhost:8080")
	web.Run()
}
