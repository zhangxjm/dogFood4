package controllers

import (
	"project58/backend/models"
	"project58/backend/utils"
)

type StockRecordController struct {
	utils.BaseController
}

type StockRecordListResponse struct {
	models.StockRecord
	SupplyName string `json:"supply_name"`
	UserName   string `json:"user_name"`
}

func (c *StockRecordController) List() {
	if !c.RequireRole(2, 3) {
		return
	}

	var records []models.StockRecord
	utils.DB.Order("created_at desc").Find(&records)

	var result []StockRecordListResponse
	for _, r := range records {
		var supply models.Supply
		var user models.User
		utils.DB.First(&supply, r.SupplyID)
		utils.DB.First(&user, r.UserID)
		result = append(result, StockRecordListResponse{
			StockRecord: r,
			SupplyName:  supply.Name,
			UserName:    user.Name,
		})
	}

	c.Success(result)
}
