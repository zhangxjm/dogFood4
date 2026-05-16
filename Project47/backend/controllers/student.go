package controllers

import (
	"driving-school/models"
	"encoding/json"
	"time"

	"github.com/beego/beego/v2/client/orm"
)

type StudentController struct {
	BaseController
}

// @router / [get]
func (c *StudentController) List() {
	o := orm.NewOrm()
	var students []models.Student
	_, err := o.QueryTable("student").All(&students)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(students)
}

// @router / [post]
func (c *StudentController) Create() {
	var student models.Student
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &student)
	if err != nil {
		c.Error(400, "Invalid request body")
		return
	}
	student.EnrollDate = time.Now()
	student.Status = 1
	o := orm.NewOrm()
	_, err = o.Insert(&student)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(student)
}

// @router /:id [put]
func (c *StudentController) Update() {
	id, _ := c.GetInt(":id")
	var student models.Student
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &student)
	if err != nil {
		c.Error(400, "Invalid request body")
		return
	}
	student.Id = id
	o := orm.NewOrm()
	_, err = o.Update(&student)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(student)
}

// @router /:id [delete]
func (c *StudentController) Delete() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	_, err := o.Delete(&models.Student{Id: id})
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(nil)
}

// @router /:id [get]
func (c *StudentController) Get() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	student := models.Student{Id: id}
	err := o.Read(&student)
	if err != nil {
		c.Error(404, "Student not found")
		return
	}
	c.Success(student)
}
