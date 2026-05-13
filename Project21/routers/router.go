package routers

import (
	"visitor/controllers"

	beego "github.com/beego/beego/v2/server/web"
)

func init() {
	beego.Router("/", &controllers.VisitorController{}, "get:Get")
	beego.Router("/visitor/add", &controllers.VisitorController{}, "post:Add")
	beego.Router("/visitor/list", &controllers.VisitorController{}, "get:List")
}
