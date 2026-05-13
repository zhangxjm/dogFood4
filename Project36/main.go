package main

import (
	"attendance/handlers"
	"attendance/models"
	"html/template"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	models.InitDB()
	
	r := gin.Default()
	
	r.Static("/static", "./static")
	
	funcMap := template.FuncMap{
		"formatDate": func(t time.Time) string {
			return t.Format("2006-01-02")
		},
	}
	
	r.SetFuncMap(funcMap)
	r.LoadHTMLGlob("templates/*")
	
	r.GET("/", indexHandler)
	
	workerRoutes := r.Group("/workers")
	{
		workerRoutes.GET("", handlers.ListWorkers)
		workerRoutes.GET("/create", handlers.CreateWorkerForm)
		workerRoutes.POST("/create", handlers.CreateWorker)
		workerRoutes.GET("/edit/:id", handlers.EditWorkerForm)
		workerRoutes.POST("/edit/:id", handlers.EditWorker)
		workerRoutes.GET("/delete/:id", handlers.DeleteWorker)
	}
	
	attendanceRoutes := r.Group("/attendance")
	{
		attendanceRoutes.GET("", handlers.AttendanceIndex)
		attendanceRoutes.POST("/checkin", handlers.CheckIn)
		attendanceRoutes.POST("/checkout", handlers.CheckOut)
		attendanceRoutes.GET("/records", handlers.ListAttendanceRecords)
		attendanceRoutes.GET("/records/edit/:id", handlers.EditAttendanceRecordForm)
		attendanceRoutes.POST("/records/edit/:id", handlers.EditAttendanceRecord)
		attendanceRoutes.GET("/records/delete/:id", handlers.DeleteAttendanceRecord)
	}
	
	log.Println("服务器启动在 http://localhost:8080")
	r.Run(":8080")
}

func indexHandler(c *gin.Context) {
	var workerCount int64
	models.DB.Model(&models.Worker{}).Count(&workerCount)
	
	today := time.Now().Format("2006-01-02")
	
	var todayCheckIn int64
	models.DB.Model(&models.AttendanceRecord{}).
		Where("date = ? AND check_in != ?", today, "").
		Count(&todayCheckIn)
	
	var todayCheckOut int64
	models.DB.Model(&models.AttendanceRecord{}).
		Where("date = ? AND check_out != ?", today, "").
		Count(&todayCheckOut)
	
	var recentRecords []models.AttendanceRecord
	models.DB.Preload("Worker").
		Order("date desc, id desc").
		Limit(10).
		Find(&recentRecords)
	
	c.HTML(http.StatusOK, "index.html", gin.H{
		"title":         "首页",
		"active":        "home",
		"workerCount":   workerCount,
		"todayCheckIn":  todayCheckIn,
		"todayCheckOut": todayCheckOut,
		"recentRecords": recentRecords,
	})
}
