package controllers

import (
	"driving-school/models"
	"encoding/json"
	"time"

	"github.com/beego/beego/v2/client/orm"
)

type StudyHourController struct {
	BaseController
}

// @router / [get]
func (c *StudyHourController) List() {
	o := orm.NewOrm()
	var studyHours []models.StudyHour
	_, err := o.QueryTable("study_hour").All(&studyHours)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(studyHours)
}

// @router / [post]
func (c *StudyHourController) Create() {
	var studyHour models.StudyHour
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &studyHour)
	if err != nil {
		c.Error(400, "Invalid request body")
		return
	}
	studyHour.CreatedAt = time.Now()
	o := orm.NewOrm()
	_, err = o.Insert(&studyHour)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(studyHour)
}

// @router /:id [put]
func (c *StudyHourController) Update() {
	id, _ := c.GetInt(":id")
	var studyHour models.StudyHour
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &studyHour)
	if err != nil {
		c.Error(400, "Invalid request body")
		return
	}
	studyHour.Id = id
	o := orm.NewOrm()
	_, err = o.Update(&studyHour)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(studyHour)
}

// @router /:id [delete]
func (c *StudyHourController) Delete() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	_, err := o.Delete(&models.StudyHour{Id: id})
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(nil)
}

// @router /:id [get]
func (c *StudyHourController) Get() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	studyHour := models.StudyHour{Id: id}
	err := o.Read(&studyHour)
	if err != nil {
		c.Error(404, "StudyHour not found")
		return
	}
	c.Success(studyHour)
}

// @router /student/:studentId [get]
func (c *StudyHourController) GetByStudent() {
	studentId, _ := c.GetInt(":studentId")
	o := orm.NewOrm()
	var studyHours []models.StudyHour
	_, err := o.QueryTable("study_hour").Filter("student_id", studentId).All(&studyHours)
	if err != nil {
		c.Error(500, err.Error())
		return
	}

	type SubjectHours struct {
		Subject int     `json:"subject"`
		Hours   float64 `json:"hours"`
	}

	hoursMap := make(map[int]float64)
	for _, sh := range studyHours {
		hoursMap[sh.Subject] += sh.Hours
	}

	var result []SubjectHours
	for subject, hours := range hoursMap {
		result = append(result, SubjectHours{
			Subject: subject,
			Hours:   hours,
		})
	}

	c.Success(map[string]interface{}{
		"list":   studyHours,
		"totals": result,
	})
}
