package controllers

import (
	"visitor/models"

	beego "github.com/beego/beego/v2/server/web"
)

type VisitorController struct {
	beego.Controller
}

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func (c *VisitorController) Get() {
	c.TplName = "index.tpl"
}

func (c *VisitorController) Add() {
	name := c.GetString("name")
	phone := c.GetString("phone")
	purpose := c.GetString("purpose")

	if name == "" || phone == "" || purpose == "" {
		c.Data["json"] = Response{Code: 400, Message: "请填写完整信息"}
		c.ServeJSON()
		return
	}

	_, err := models.AddVisitor(name, phone, purpose)
	if err != nil {
		c.Data["json"] = Response{Code: 500, Message: "登记失败: " + err.Error()}
		c.ServeJSON()
		return
	}

	c.Data["json"] = Response{Code: 200, Message: "登记成功"}
	c.ServeJSON()
}

func (c *VisitorController) List() {
	keyword := c.GetString("keyword")

	var visitors []models.Visitor
	var err error

	if keyword != "" {
		visitors, err = models.SearchVisitors(keyword)
	} else {
		visitors, err = models.GetAllVisitors()
	}

	if err != nil {
		c.Data["json"] = Response{Code: 500, Message: "查询失败: " + err.Error()}
		c.ServeJSON()
		return
	}

	c.Data["json"] = Response{Code: 200, Message: "查询成功", Data: visitors}
	c.ServeJSON()
}
