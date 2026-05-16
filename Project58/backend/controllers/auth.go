package controllers

import (
	"project58/backend/models"
	"project58/backend/utils"

	"golang.org/x/crypto/bcrypt"
)

type AuthController struct {
	utils.BaseController
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func (c *AuthController) Login() {
	var req LoginRequest
	if err := c.ParseForm(&req); err != nil {
		c.Error(400, "参数错误")
		return
	}

	if req.Username == "" || req.Password == "" {
		c.Error(400, "用户名和密码不能为空")
		return
	}

	var user models.User
	if err := utils.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.Error(400, "用户名或密码错误")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.Error(400, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		c.Error(500, "生成token失败")
		return
	}

	c.Success(LoginResponse{
		Token: token,
		User:  user,
	})
}

func (c *AuthController) UserInfo() {
	if !c.RequireAuth() {
		return
	}

	var user models.User
	if err := utils.DB.Where("id = ?", c.UserID).First(&user).Error; err != nil {
		c.Error(404, "用户不存在")
		return
	}

	c.Success(user)
}
