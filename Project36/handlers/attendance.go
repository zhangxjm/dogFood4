package handlers

import (
	"attendance/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type AttendanceForm struct {
	WorkerID  string `form:"worker_id" binding:"required"`
	Date      string `form:"date" binding:"required"`
	CheckIn   string `form:"check_in"`
	CheckOut  string `form:"check_out"`
	Status    string `form:"status"`
	Remark    string `form:"remark"`
}

func AttendanceIndex(c *gin.Context) {
	var workers []models.Worker
	models.DB.Find(&workers)
	
	today := time.Now().Format("2006-01-02")
	
	c.HTML(http.StatusOK, "attendance.html", gin.H{
		"title":   "签到签退",
		"active":  "attendance",
		"workers": workers,
		"today":   today,
	})
}

func CheckIn(c *gin.Context) {
	var form AttendanceForm
	if err := c.ShouldBind(&form); err != nil {
		var workers []models.Worker
		models.DB.Find(&workers)
		c.HTML(http.StatusOK, "attendance.html", gin.H{
			"title":   "签到签退",
			"active":  "attendance",
			"error":   "请选择工人和日期",
			"workers": workers,
			"today":   time.Now().Format("2006-01-02"),
		})
		return
	}
	
	workerID, _ := strconv.Atoi(form.WorkerID)
	
	var record models.AttendanceRecord
	err := models.DB.Where("worker_id = ? AND DATE(date) = ?", workerID, form.Date).First(&record).Error
	
	if err != nil {
		date, _ := time.ParseInLocation("2006-01-02", form.Date, time.Local)
		record = models.AttendanceRecord{
			WorkerID: uint(workerID),
			Date:     date,
			CheckIn:  form.CheckIn,
			Status:   form.Status,
			Remark:   form.Remark,
		}
		if err := models.DB.Create(&record).Error; err != nil {
			c.Redirect(http.StatusFound, "/attendance")
			return
		}
	} else {
		if record.CheckIn != "" {
			var workers []models.Worker
			models.DB.Find(&workers)
			c.HTML(http.StatusOK, "attendance.html", gin.H{
				"title":   "签到签退",
				"active":  "attendance",
				"error":   "该工人今日已签到",
				"workers": workers,
				"today":   form.Date,
			})
			return
		}
		record.CheckIn = form.CheckIn
		if form.Status != "" {
			record.Status = form.Status
		}
		if form.Remark != "" {
			record.Remark = form.Remark
		}
		models.DB.Save(&record)
	}
	
	c.Redirect(http.StatusFound, "/attendance/records")
}

func CheckOut(c *gin.Context) {
	var form AttendanceForm
	if err := c.ShouldBind(&form); err != nil {
		c.Redirect(http.StatusFound, "/attendance")
		return
	}
	
	workerID, _ := strconv.Atoi(form.WorkerID)
	
	var record models.AttendanceRecord
	err := models.DB.Where("worker_id = ? AND DATE(date) = ?", workerID, form.Date).First(&record).Error
	
	if err != nil {
		var workers []models.Worker
		models.DB.Find(&workers)
		c.HTML(http.StatusOK, "attendance.html", gin.H{
			"title":   "签到签退",
			"active":  "attendance",
			"error":   "该工人今日未签到",
			"workers": workers,
			"today":   form.Date,
		})
		return
	}
	
	if record.CheckOut != "" {
		var workers []models.Worker
		models.DB.Find(&workers)
		c.HTML(http.StatusOK, "attendance.html", gin.H{
			"title":   "签到签退",
			"active":  "attendance",
			"error":   "该工人今日已签退",
			"workers": workers,
			"today":   form.Date,
		})
		return
	}
	
	record.CheckOut = form.CheckOut
	if form.Status != "" {
		record.Status = form.Status
	}
	if form.Remark != "" {
		record.Remark = form.Remark
	}
	
	models.DB.Save(&record)
	c.Redirect(http.StatusFound, "/attendance/records")
}

func ListAttendanceRecords(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	workerID := c.Query("worker_id")
	status := c.Query("status")
	
	var workers []models.Worker
	models.DB.Find(&workers)
	
	query := models.DB.Preload("Worker").Order("date desc, id desc")
	
	if startDate != "" && endDate != "" {
		query = query.Where("DATE(date) BETWEEN ? AND ?", startDate, endDate)
	}
	
	if workerID != "" && workerID != "0" {
		query = query.Where("worker_id = ?", workerID)
	}
	
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}
	
	var records []models.AttendanceRecord
	query.Find(&records)
	
	c.HTML(http.StatusOK, "records.html", gin.H{
		"title":      "出勤记录",
		"active":     "records",
		"records":    records,
		"workers":    workers,
		"start_date": startDate,
		"end_date":   endDate,
		"worker_id":  workerID,
		"status":     status,
	})
}

func DeleteAttendanceRecord(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	models.DB.Delete(&models.AttendanceRecord{}, id)
	c.Redirect(http.StatusFound, "/attendance/records")
}

func EditAttendanceRecordForm(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var record models.AttendanceRecord
	if err := models.DB.Preload("Worker").First(&record, id).Error; err != nil {
		c.Redirect(http.StatusFound, "/attendance/records")
		return
	}
	
	var workers []models.Worker
	models.DB.Find(&workers)
	
	c.HTML(http.StatusOK, "attendance_edit.html", gin.H{
		"title":   "编辑出勤记录",
		"active":  "records",
		"record":  record,
		"workers": workers,
	})
}

func EditAttendanceRecord(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var record models.AttendanceRecord
	if err := models.DB.First(&record, id).Error; err != nil {
		c.Redirect(http.StatusFound, "/attendance/records")
		return
	}
	
	var form AttendanceForm
	if err := c.ShouldBind(&form); err != nil {
		var workers []models.Worker
		models.DB.Find(&workers)
		c.HTML(http.StatusOK, "attendance_edit.html", gin.H{
			"title":   "编辑出勤记录",
			"active":  "records",
			"record":  record,
			"workers": workers,
			"error":   "请填写必填字段",
		})
		return
	}
	
	workerID, _ := strconv.Atoi(form.WorkerID)
	date, _ := time.ParseInLocation("2006-01-02", form.Date, time.Local)
	
	record.WorkerID = uint(workerID)
	record.Date = date
	record.CheckIn = form.CheckIn
	record.CheckOut = form.CheckOut
	record.Status = form.Status
	record.Remark = form.Remark
	
	models.DB.Save(&record)
	c.Redirect(http.StatusFound, "/attendance/records")
}
