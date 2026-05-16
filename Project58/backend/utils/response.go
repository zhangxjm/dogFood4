package utils

import (
	"github.com/beego/beego/v2/server/web"
)

type BaseController struct {
	web.Controller
	UserID   uint
	Username string
	Role     int
}

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func (c *BaseController) Prepare() {
	authHeader := c.Ctx.Request.Header.Get("Authorization")
	if authHeader == "" {
		return
	}

	tokenString, err := ExtractToken(authHeader)
	if err != nil {
		return
	}

	claims, err := ParseToken(tokenString)
	if err != nil {
		return
	}

	c.UserID = claims.UserID
	c.Username = claims.Username
	c.Role = claims.Role
}

func (c *BaseController) Success(data interface{}) {
	c.Data["json"] = Response{
		Code:    200,
		Message: "success",
		Data:    data,
	}
	c.ServeJSON()
}

func (c *BaseController) SuccessMsg(message string) {
	c.Data["json"] = Response{
		Code:    200,
		Message: message,
		Data:    nil,
	}
	c.ServeJSON()
}

func (c *BaseController) Error(code int, message string) {
	c.Data["json"] = Response{
		Code:    code,
		Message: message,
		Data:    nil,
	}
	c.ServeJSON()
}

func (c *BaseController) RequireAuth() bool {
	if c.UserID == 0 {
		c.Error(401, "未登录")
		return false
	}
	return true
}

func (c *BaseController) RequireRole(roles ...int) bool {
	if !c.RequireAuth() {
		return false
	}

	for _, role := range roles {
		if c.Role == role {
			return true
		}
	}

	c.Error(403, "权限不足")
	return false
}
