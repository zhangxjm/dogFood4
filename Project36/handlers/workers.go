package handlers

import (
	"attendance/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type WorkerForm struct {
	Name       string `form:"name" binding:"required"`
	WorkerNo   string `form:"worker_no" binding:"required"`
	Phone      string `form:"phone"`
	Department string `form:"department"`
	Position   string `form:"position"`
}

func ListWorkers(c *gin.Context) {
	var workers []models.Worker
	models.DB.Order("created_at desc").Find(&workers)
	
	c.HTML(http.StatusOK, "workers.html", gin.H{
		"title":   "工人管理",
		"active":  "workers",
		"workers": workers,
	})
}

func CreateWorkerForm(c *gin.Context) {
	c.HTML(http.StatusOK, "worker_form.html", gin.H{
		"title":  "添加工人",
		"active": "workers",
		"action": "/workers/create",
	})
}

func CreateWorker(c *gin.Context) {
	var form WorkerForm
	if err := c.ShouldBind(&form); err != nil {
		c.HTML(http.StatusOK, "worker_form.html", gin.H{
			"title":  "添加工人",
			"active": "workers",
			"action": "/workers/create",
			"error":  "请填写必填字段",
		})
		return
	}
	
	var existing models.Worker
	if models.DB.Where("worker_no = ?", form.WorkerNo).First(&existing).Error == nil {
		c.HTML(http.StatusOK, "worker_form.html", gin.H{
			"title":  "添加工人",
			"active": "workers",
			"action": "/workers/create",
			"error":  "工号已存在",
		})
		return
	}
	
	worker := models.Worker{
		Name:       form.Name,
		WorkerNo:   form.WorkerNo,
		Phone:      form.Phone,
		Department: form.Department,
		Position:   form.Position,
	}
	
	if err := models.DB.Create(&worker).Error; err != nil {
		c.HTML(http.StatusOK, "worker_form.html", gin.H{
			"title":  "添加工人",
			"active": "workers",
			"action": "/workers/create",
			"error":  "创建失败",
		})
		return
	}
	
	c.Redirect(http.StatusFound, "/workers")
}

func EditWorkerForm(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var worker models.Worker
	if err := models.DB.First(&worker, id).Error; err != nil {
		c.Redirect(http.StatusFound, "/workers")
		return
	}
	
	c.HTML(http.StatusOK, "worker_form.html", gin.H{
		"title":  "编辑工人",
		"active": "workers",
		"action": "/workers/edit/" + c.Param("id"),
		"worker": worker,
	})
}

func EditWorker(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var worker models.Worker
	if err := models.DB.First(&worker, id).Error; err != nil {
		c.Redirect(http.StatusFound, "/workers")
		return
	}
	
	var form WorkerForm
	if err := c.ShouldBind(&form); err != nil {
		c.HTML(http.StatusOK, "worker_form.html", gin.H{
			"title":  "编辑工人",
			"active": "workers",
			"action": "/workers/edit/" + c.Param("id"),
			"worker": worker,
			"error":  "请填写必填字段",
		})
		return
	}
	
	var existing models.Worker
	if models.DB.Where("worker_no = ? AND id != ?", form.WorkerNo, id).First(&existing).Error == nil {
		c.HTML(http.StatusOK, "worker_form.html", gin.H{
			"title":  "编辑工人",
			"active": "workers",
			"action": "/workers/edit/" + c.Param("id"),
			"worker": worker,
			"error":  "工号已存在",
		})
		return
	}
	
	worker.Name = form.Name
	worker.WorkerNo = form.WorkerNo
	worker.Phone = form.Phone
	worker.Department = form.Department
	worker.Position = form.Position
	
	if err := models.DB.Save(&worker).Error; err != nil {
		c.HTML(http.StatusOK, "worker_form.html", gin.H{
			"title":  "编辑工人",
			"active": "workers",
			"action": "/workers/edit/" + c.Param("id"),
			"worker": worker,
			"error":  "更新失败",
		})
		return
	}
	
	c.Redirect(http.StatusFound, "/workers")
}

func DeleteWorker(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	models.DB.Delete(&models.Worker{}, id)
	c.Redirect(http.StatusFound, "/workers")
}
