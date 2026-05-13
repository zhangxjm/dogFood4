package controllers

import (
	"campus-job/models"
	"strconv"

	"github.com/beego/beego/v2/server/web"
)

type JobController struct {
	web.Controller
}

func (c *JobController) Prepare() {
	c.Layout = "layout.tpl"
}

func (c *JobController) Get() {
	jobs, err := models.GetAllJobs()
	if err != nil {
		c.Data["Error"] = err.Error()
	} else {
		c.Data["Jobs"] = jobs
	}
	c.TplName = "index.tpl"
}

func (c *JobController) Create() {
	if c.Ctx.Request.Method == "POST" {
		job := &models.Job{
			Title:       c.GetString("title"),
			Company:     c.GetString("company"),
			Description: c.GetString("description"),
			Salary:      c.GetString("salary"),
			Location:    c.GetString("location"),
			WorkTime:    c.GetString("work_time"),
			Requirement: c.GetString("requirement"),
			Contact:     c.GetString("contact"),
		}

		err := models.CreateJob(job)
		if err != nil {
			c.Data["Error"] = "发布失败: " + err.Error()
			c.TplName = "create.tpl"
			return
		}
		c.Redirect("/", 302)
		return
	}
	c.TplName = "create.tpl"
}

func (c *JobController) Edit() {
	idStr := c.Ctx.Input.Param(":id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.Redirect("/", 302)
		return
	}

	if c.Ctx.Request.Method == "POST" {
		job := &models.Job{
			ID:          id,
			Title:       c.GetString("title"),
			Company:     c.GetString("company"),
			Description: c.GetString("description"),
			Salary:      c.GetString("salary"),
			Location:    c.GetString("location"),
			WorkTime:    c.GetString("work_time"),
			Requirement: c.GetString("requirement"),
			Contact:     c.GetString("contact"),
		}

		err := models.UpdateJob(job)
		if err != nil {
			c.Data["Error"] = "更新失败: " + err.Error()
		} else {
			c.Redirect("/", 302)
			return
		}
	}

	job, err := models.GetJobByID(id)
	if err != nil {
		c.Redirect("/", 302)
		return
	}
	c.Data["Job"] = job
	c.TplName = "edit.tpl"
}

func (c *JobController) Delete() {
	idStr := c.Ctx.Input.Param(":id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.Redirect("/", 302)
		return
	}

	models.DeleteJob(id)
	c.Redirect("/", 302)
}

func (c *JobController) Detail() {
	idStr := c.Ctx.Input.Param(":id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.Redirect("/", 302)
		return
	}

	job, err := models.GetJobByID(id)
	if err != nil {
		c.Redirect("/", 302)
		return
	}
	c.Data["Job"] = job
	c.TplName = "detail.tpl"
}
