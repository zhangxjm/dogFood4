package controllers

import (
	"project58/backend/models"
	"project58/backend/utils"
	"strconv"
)

type CategoryController struct {
	utils.BaseController
}

func (c *CategoryController) List() {
	if !c.RequireAuth() {
		return
	}

	var categories []models.Category
	utils.DB.Find(&categories)
	c.Success(categories)
}

func (c *CategoryController) Get() {
	if !c.RequireRole(3) {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var category models.Category
	if err := utils.DB.First(&category, id).Error; err != nil {
		c.Error(404, "分类不存在")
		return
	}

	c.Success(category)
}

func (c *CategoryController) Create() {
	if !c.RequireRole(3) {
		return
	}

	var category models.Category
	if err := c.ParseForm(&category); err != nil {
		c.Error(400, "参数错误")
		return
	}

	if category.Name == "" {
		c.Error(400, "分类名称不能为空")
		return
	}

	if err := utils.DB.Create(&category).Error; err != nil {
		c.Error(500, "创建失败")
		return
	}

	c.Success(category)
}

func (c *CategoryController) Update() {
	if !c.RequireRole(3) {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var category models.Category
	if err := utils.DB.First(&category, id).Error; err != nil {
		c.Error(404, "分类不存在")
		return
	}

	var req models.Category
	if err := c.ParseForm(&req); err != nil {
		c.Error(400, "参数错误")
		return
	}

	category.Name = req.Name
	category.Description = req.Description

	if err := utils.DB.Save(&category).Error; err != nil {
		c.Error(500, "更新失败")
		return
	}

	c.Success(category)
}

func (c *CategoryController) Delete() {
	if !c.RequireRole(3) {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var category models.Category
	if err := utils.DB.First(&category, id).Error; err != nil {
		c.Error(404, "分类不存在")
		return
	}

	if err := utils.DB.Delete(&category).Error; err != nil {
		c.Error(500, "删除失败")
		return
	}

	c.SuccessMsg("删除成功")
}
