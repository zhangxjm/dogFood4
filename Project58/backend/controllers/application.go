package controllers

import (
	"project58/backend/models"
	"project58/backend/utils"
	"strconv"
)

type ApplicationController struct {
	utils.BaseController
}

type ApplicationItemRequest struct {
	SupplyID uint `json:"supply_id"`
	Quantity int  `json:"quantity"`
}

type CreateApplicationRequest struct {
	Title  string                    `json:"title"`
	Items  []ApplicationItemRequest `json:"items"`
	Remark string                    `json:"remark"`
}

type ApplicationListResponse struct {
	models.Application
	UserName string `json:"user_name"`
}

type ApplicationDetailItem struct {
	models.ApplicationItem
	SupplyName string `json:"supply_name"`
	Unit       string `json:"unit"`
}

type ApplicationDetailResponse struct {
	models.Application
	UserName string                       `json:"user_name"`
	Items    []ApplicationDetailItem      `json:"items"`
}

func (c *ApplicationController) List() {
	if !c.RequireAuth() {
		return
	}

	var applications []models.Application
	utils.DB.Where("user_id = ?", c.UserID).Find(&applications)

	var result []ApplicationListResponse
	for _, app := range applications {
		var user models.User
		utils.DB.First(&user, app.UserID)
		result = append(result, ApplicationListResponse{
			Application: app,
			UserName:    user.Name,
		})
	}

	c.Success(result)
}

func (c *ApplicationController) PendingList() {
	if !c.RequireRole(2, 3) {
		return
	}

	var applications []models.Application
	if c.Role == 2 {
		utils.DB.Where("status = 0").Find(&applications)
	} else {
		utils.DB.Where("status IN (0, 1)").Find(&applications)
	}

	var result []ApplicationListResponse
	for _, app := range applications {
		var user models.User
		utils.DB.First(&user, app.UserID)
		result = append(result, ApplicationListResponse{
			Application: app,
			UserName:    user.Name,
		})
	}

	c.Success(result)
}

func (c *ApplicationController) Get() {
	if !c.RequireAuth() {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var application models.Application
	if err := utils.DB.Preload("Items").First(&application, id).Error; err != nil {
		c.Error(404, "申领不存在")
		return
	}

	var user models.User
	utils.DB.First(&user, application.UserID)

	var items []ApplicationDetailItem
	for _, item := range application.Items {
		var supply models.Supply
		utils.DB.First(&supply, item.SupplyID)
		items = append(items, ApplicationDetailItem{
			ApplicationItem: item,
			SupplyName:      supply.Name,
			Unit:            supply.Unit,
		})
	}

	result := ApplicationDetailResponse{
		Application: application,
		UserName:    user.Name,
		Items:       items,
	}

	c.Success(result)
}

func (c *ApplicationController) Create() {
	if !c.RequireAuth() {
		return
	}

	var req CreateApplicationRequest
	if err := c.ParseForm(&req); err != nil {
		c.Error(400, "参数错误")
		return
	}

	if req.Title == "" {
		c.Error(400, "申领标题不能为空")
		return
	}

	if len(req.Items) == 0 {
		c.Error(400, "申领物品不能为空")
		return
	}

	for _, item := range req.Items {
		if item.SupplyID == 0 {
			c.Error(400, "物品ID不能为空")
			return
		}
		if item.Quantity <= 0 {
			c.Error(400, "数量必须大于0")
			return
		}
	}

	tx := utils.DB.Begin()

	application := models.Application{
		UserID: c.UserID,
		Title:  req.Title,
		Status: 0,
		Remark: req.Remark,
	}
	if err := tx.Create(&application).Error; err != nil {
		tx.Rollback()
		c.Error(500, "创建失败")
		return
	}

	for _, item := range req.Items {
		appItem := models.ApplicationItem{
			ApplicationID: application.ID,
			SupplyID:      item.SupplyID,
			Quantity:      item.Quantity,
		}
		if err := tx.Create(&appItem).Error; err != nil {
			tx.Rollback()
			c.Error(500, "创建失败")
			return
		}
	}

	tx.Commit()
	c.Success(application)
}

func (c *ApplicationController) Delete() {
	if !c.RequireAuth() {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var application models.Application
	if err := utils.DB.First(&application, id).Error; err != nil {
		c.Error(404, "申领不存在")
		return
	}

	if application.UserID != c.UserID {
		c.Error(403, "只能删除自己的申领")
		return
	}

	if application.Status != 0 {
		c.Error(400, "只能删除待审批的申领")
		return
	}

	tx := utils.DB.Begin()

	tx.Where("application_id = ?", application.ID).Delete(&models.ApplicationItem{})

	if err := tx.Delete(&application).Error; err != nil {
		tx.Rollback()
		c.Error(500, "删除失败")
		return
	}

	tx.Commit()
	c.SuccessMsg("删除成功")
}

func (c *ApplicationController) Approve() {
	if !c.RequireRole(2, 3) {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var application models.Application
	if err := utils.DB.Preload("Items").First(&application, id).Error; err != nil {
		c.Error(404, "申领不存在")
		return
	}

	if c.Role == 2 && application.Status != 0 {
		c.Error(400, "只能审批待审批的申领")
		return
	}

	if c.Role == 3 && application.Status != 0 && application.Status != 1 {
		c.Error(400, "只能审批待审批或一级通过的申领")
		return
	}

	tx := utils.DB.Begin()

	if application.Status == 0 {
		if c.Role == 2 {
			application.Status = 1
		} else {
			application.Status = 2
		}
	} else if application.Status == 1 && c.Role == 3 {
		application.Status = 2
	}

	if application.Status == 2 {
		for _, item := range application.Items {
			var supply models.Supply
			if err := tx.First(&supply, item.SupplyID).Error; err != nil {
				tx.Rollback()
				c.Error(400, "物品不存在")
				return
			}

			if supply.Stock < item.Quantity {
				tx.Rollback()
				c.Error(400, "库存不足")
				return
			}

			stockBefore := supply.Stock
			supply.Stock -= item.Quantity
			if err := tx.Save(&supply).Error; err != nil {
				tx.Rollback()
				c.Error(500, "审批失败")
				return
			}

			record := models.StockRecord{
				SupplyID:    supply.ID,
				Type:        2,
				Quantity:    item.Quantity,
				StockBefore: stockBefore,
				StockAfter:  supply.Stock,
				UserID:      c.UserID,
				Remark:      "申领出库: " + application.Title,
			}
			if err := tx.Create(&record).Error; err != nil {
				tx.Rollback()
				c.Error(500, "审批失败")
				return
			}
		}
	}

	if err := tx.Save(&application).Error; err != nil {
		tx.Rollback()
		c.Error(500, "审批失败")
		return
	}

	tx.Commit()
	c.Success(application)
}

func (c *ApplicationController) Reject() {
	if !c.RequireRole(2, 3) {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var application models.Application
	if err := utils.DB.First(&application, id).Error; err != nil {
		c.Error(404, "申领不存在")
		return
	}

	if application.Status != 0 && application.Status != 1 {
		c.Error(400, "只能驳回待审批或一级通过的申领")
		return
	}

	application.Status = 3
	if err := utils.DB.Save(&application).Error; err != nil {
		c.Error(500, "驳回失败")
		return
	}

	c.SuccessMsg("驳回成功")
}

func (c *ApplicationController) Receive() {
	if !c.RequireAuth() {
		return
	}

	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)

	var application models.Application
	if err := utils.DB.First(&application, id).Error; err != nil {
		c.Error(404, "申领不存在")
		return
	}

	if application.UserID != c.UserID {
		c.Error(403, "只能确认自己的申领")
		return
	}

	if application.Status != 2 {
		c.Error(400, "只能确认已二级审批通过的申领")
		return
	}

	application.Status = 4
	if err := utils.DB.Save(&application).Error; err != nil {
		c.Error(500, "确认失败")
		return
	}

	c.SuccessMsg("确认收货成功")
}
