package controllers

import (
	"driving-school/models"
	"encoding/json"

	"github.com/beego/beego/v2/client/orm"
)

type CoachController struct {
	BaseController
}

// @router / [get]
func (c *CoachController) List() {
	o := orm.NewOrm()
	var coaches []models.Coach
	_, err := o.QueryTable("coach").All(&coaches)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(coaches)
}

// @router / [post]
func (c *CoachController) Create() {
	var coach models.Coach
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &coach)
	if err != nil {
		c.Error(400, "Invalid request body")
		return
	}
	coach.Status = 1
	o := orm.NewOrm()
	_, err = o.Insert(&coach)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(coach)
}

// @router /:id [put]
func (c *CoachController) Update() {
	id, _ := c.GetInt(":id")
	var coach models.Coach
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &coach)
	if err != nil {
		c.Error(400, "Invalid request body")
		return
	}
	coach.Id = id
	o := orm.NewOrm()
	_, err = o.Update(&coach)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(coach)
}

// @router /:id [delete]
func (c *CoachController) Delete() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	_, err := o.Delete(&models.Coach{Id: id})
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(nil)
}

// @router /:id [get]
func (c *CoachController) Get() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	coach := models.Coach{Id: id}
	err := o.Read(&coach)
	if err != nil {
		c.Error(404, "Coach not found")
		return
	}
	c.Success(coach)
}
