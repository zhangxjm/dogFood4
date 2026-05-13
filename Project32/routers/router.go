package routers

import (
	"campus-job/controllers"

	"github.com/beego/beego/v2/server/web"
)

func init() {
	web.Router("/", &controllers.JobController{})
	web.Router("/create", &controllers.JobController{}, "get,post:Create")
	web.Router("/edit/:id", &controllers.JobController{}, "get,post:Edit")
	web.Router("/delete/:id", &controllers.JobController{}, "get:Delete")
	web.Router("/job/:id", &controllers.JobController{}, "get:Detail")
}
