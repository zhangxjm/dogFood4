package controllers

import (
	"driving-school/models"
	"encoding/json"
	"time"

	"github.com/beego/beego/v2/client/orm"
)

type ExamScoreController struct {
	BaseController
}

// @router / [get]
func (c *ExamScoreController) List() {
	o := orm.NewOrm()
	var examScores []models.ExamScore
	_, err := o.QueryTable("exam_score").All(&examScores)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(examScores)
}

// @router / [post]
func (c *ExamScoreController) Create() {
	var examScore models.ExamScore
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &examScore)
	if err != nil {
		c.Error(400, "Invalid request body")
		return
	}
	examScore.CreatedAt = time.Now()
	o := orm.NewOrm()
	_, err = o.Insert(&examScore)
	if err != nil {
		c.Error(500, err.Error())
		return
	}

	if examScore.IsPassed == 1 && examScore.Subject < 4 {
		student := models.Student{Id: examScore.StudentId}
		if err := o.Read(&student); err == nil {
			student.CurrentSubject = examScore.Subject + 1
			o.Update(&student)
		}
	}

	if examScore.IsPassed == 1 && examScore.Subject == 4 {
		student := models.Student{Id: examScore.StudentId}
		if err := o.Read(&student); err == nil {
			student.Status = 2
			o.Update(&student)
		}
	}

	c.Success(examScore)
}

// @router /:id [put]
func (c *ExamScoreController) Update() {
	id, _ := c.GetInt(":id")
	var examScore models.ExamScore
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &examScore)
	if err != nil {
		c.Error(400, "Invalid request body")
		return
	}
	examScore.Id = id
	o := orm.NewOrm()
	_, err = o.Update(&examScore)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(examScore)
}

// @router /:id [delete]
func (c *ExamScoreController) Delete() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	_, err := o.Delete(&models.ExamScore{Id: id})
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(nil)
}

// @router /:id [get]
func (c *ExamScoreController) Get() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	examScore := models.ExamScore{Id: id}
	err := o.Read(&examScore)
	if err != nil {
		c.Error(404, "ExamScore not found")
		return
	}
	c.Success(examScore)
}

// @router /student/:studentId [get]
func (c *ExamScoreController) GetByStudent() {
	studentId, _ := c.GetInt(":studentId")
	o := orm.NewOrm()
	var examScores []models.ExamScore
	_, err := o.QueryTable("exam_score").Filter("student_id", studentId).All(&examScores)
	if err != nil {
		c.Error(500, err.Error())
		return
	}
	c.Success(examScores)
}
