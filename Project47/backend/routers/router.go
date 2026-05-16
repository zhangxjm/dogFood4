package routers

import (
	"driving-school/controllers"

	"github.com/beego/beego/v2/server/web"
)

func init() {
	ns := web.NewNamespace("/api/v1",
		web.NSNamespace("/students",
			web.NSInclude(
				&controllers.StudentController{},
			),
		),
		web.NSNamespace("/coaches",
			web.NSInclude(
				&controllers.CoachController{},
			),
		),
		web.NSNamespace("/reservations",
			web.NSInclude(
				&controllers.ReservationController{},
			),
		),
		web.NSNamespace("/studyhours",
			web.NSInclude(
				&controllers.StudyHourController{},
			),
		),
		web.NSNamespace("/examscores",
			web.NSInclude(
				&controllers.ExamScoreController{},
			),
		),
		web.NSNamespace("/statistics",
			web.NSInclude(
				&controllers.StatisticsController{},
			),
		),
	)
	web.AddNamespace(ns)
}
