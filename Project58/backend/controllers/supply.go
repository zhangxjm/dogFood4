package controllers

import (
	"project58/backend/models"
	"project58/backend/utils"
	"strconv"
)

type SupplyController struct {
	utils.BaseController
}

type SupplyListResponse struct {
	models.Supply
	CategoryName string `json:"category_name"`
}

type StockInRequest struct {
	Quantity int    `json:"quantity"`
	Remark   string `json:"remark"`
}

func (c *SupplyController) List() {
	if !c.RequireAuth() {
		return
	}

	keyword := c.GetString("keyword")
	categoryID := c.GetString("category_id")

	var supplies []models.Supply
	query := utils.DB

	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	query.Find(&supplies)

	var result []SupplyListResponse
	for _, s := range supplies {
		var category models.Category
		utils.DB.First(&category, s.CategoryID)
		result = append(result, SupplyListResponse{
			Supply:       s,
			CategoryName: category.Name,
		})
	}

	c.Success(result)
}

func (c *SupplyController) Get() {
	if !c.RequireAuth() {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var supply models.Supply
	if err := utils.DB.First(&supply, id).Error; err != nil {
		c.Error(404, "物品不存在")
		return
	}

	c.Success(supply)
}

func (c *SupplyController) Create() {
	if !c.RequireRole(2, 3) {
		return
	}

	var supply models.Supply
	if err := c.ParseForm(&supply); err != nil {
		c.Error(400, "参数错误")
		return
	}

	if supply.Name == "" {
		c.Error(400, "物品名称不能为空")
		return
	}

	if supply.CategoryID == 0 {
		c.Error(400, "分类不能为空")
		return
	}

	if err := utils.DB.Create(&supply).Error; err != nil {
		c.Error(500, "创建失败")
		return
	}

	c.Success(supply)
}

func (c *SupplyController) Update() {
	if !c.RequireRole(2, 3) {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var supply models.Supply
	if err := utils.DB.First(&supply, id).Error; err != nil {
		c.Error(404, "物品不存在")
		return
	}

	var req models.Supply
	if err := c.ParseForm(&req); err != nil {
		c.Error(400, "参数错误")
		return
	}

	supply.CategoryID = req.CategoryID
	supply.Name = req.Name
	supply.Spec = req.Spec
	supply.Unit = req.Unit
	supply.MinStock = req.MinStock
	supply.Description = req.Description

	if err := utils.DB.Save(&supply).Error; err != nil {
		c.Error(500, "更新失败")
		return
	}

	c.Success(supply)
}

func (c *SupplyController) Delete() {
	if !c.RequireRole(2, 3) {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var supply models.Supply
	if err := utils.DB.First(&supply, id).Error; err != nil {
		c.Error(404, "物品不存在")
		return
	}

	if err := utils.DB.Delete(&supply).Error; err != nil {
		c.Error(500, "删除失败")
		return
	}

	c.SuccessMsg("删除成功")
}

func (c *SupplyController) StockIn() {
	if !c.RequireRole(2, 3) {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var supply models.Supply
	if err := utils.DB.First(&supply, id).Error; err != nil {
		c.Error(404, "物品不存在")
		return
	}

	var req StockInRequest
	if err := c.ParseForm(&req); err != nil {
		c.Error(400, "参数错误")
		return
	}

	if req.Quantity <= 0 {
		c.Error(400, "数量必须大于0")
		return
	}

	tx := utils.DB.Begin()

	stockBefore := supply.Stock
	supply.Stock += req.Quantity
	if err := tx.Save(&supply).Error; err != nil {
		tx.Rollback()
		c.Error(500, "入库失败")
		return
	}

	record := models.StockRecord{
		SupplyID:    supply.ID,
		Type:        1,
		Quantity:    req.Quantity,
		StockBefore: stockBefore,
		StockAfter:  supply.Stock,
		UserID:      c.UserID,
		Remark:      req.Remark,
	}
	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		c.Error(500, "入库失败")
		return
	}

	tx.Commit()
	c.Success(supply)
}
