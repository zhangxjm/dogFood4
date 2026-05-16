package controllers

import (
	"project58/backend/models"
	"project58/backend/utils"
)

type StatsController struct {
	utils.BaseController
}

type DashboardStats struct {
	TotalSupplies      int64 `json:"total_supplies"`
	LowStockCount      int64 `json:"low_stock_count"`
	TotalApplications  int64 `json:"total_applications"`
	PendingApplications int64 `json:"pending_applications"`
}

func (c *StatsController) Dashboard() {
	if !c.RequireAuth() {
		return
	}

	var stats DashboardStats

	utils.DB.Model(&models.Supply{}).Count(&stats.TotalSupplies)

	utils.DB.Model(&models.Supply{}).Where("stock < min_stock").Count(&stats.LowStockCount)

	utils.DB.Model(&models.Application{}).Count(&stats.TotalApplications)

	utils.DB.Model(&models.Application{}).Where("status IN (0, 1)").Count(&stats.PendingApplications)

	c.Success(stats)
}
