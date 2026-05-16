package controllers

import (
	"driving-school/models"
	"encoding/json"
	"time"

	"github.com/beego/beego/v2/client/orm"
)

type ReservationController struct {
	BaseController
}

// @router / [get]
func (c *ReservationController) List() {
	o := orm.NewOrm()
	var reservations []models.Reservation
	_, err := o.QueryTable("reservation").All(&reservations)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(reservations)
}

// @router / [post]
func (c *ReservationController) Create() {
	var reservation models.Reservation
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &reservation)
	if err != nil {
		c.Error(400, "Invalid request body")
		return
	}

	o := orm.NewOrm()

	count, _ := o.QueryTable("reservation").
		Filter("student_id", reservation.StudentId).
		Filter("date", reservation.Date).
		Count()
	if count > 0 {
		c.Error(400, "该学员当天已有预约")
		return
	}

	count2, _ := o.QueryTable("reservation").
		Filter("coach_id", reservation.CoachId).
		Filter("date", reservation.Date).
		Filter("time_slot", reservation.TimeSlot).
		Count()
	if count2 > 0 {
		c.Error(400, "该教练该时段已被预约")
		return
	}

	reservation.Status = 1
	reservation.CreatedAt = time.Now()
	_, err = o.Insert(&reservation)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(reservation)
}

// @router /:id [put]
func (c *ReservationController) Update() {
	id, _ := c.GetInt(":id")
	var reservation models.Reservation
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &reservation)
	if err != nil {
		c.Error(400, "Invalid request body")
		return
	}
	reservation.Id = id
	o := orm.NewOrm()
	_, err = o.Update(&reservation)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(reservation)
}

// @router /:id [delete]
func (c *ReservationController) Delete() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	_, err := o.Delete(&models.Reservation{Id: id})
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(nil)
}

// @router /:id [get]
func (c *ReservationController) Get() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	reservation := models.Reservation{Id: id}
	err := o.Read(&reservation)
	if err != nil {
		c.Error(404, "Reservation not found")
		return
	}
	c.Success(reservation)
}
