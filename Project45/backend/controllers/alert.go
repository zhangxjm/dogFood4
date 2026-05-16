package controllers

import (
	"net/http"
	"strconv"
	"warehouse-management/models"
	"warehouse-management/utils"

	"github.com/gin-gonic/gin"
)

func GetAlerts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	isRead := c.Query("is_read")

	var alerts []models.AlertRecord
	var total int64

	query := models.DB.Model(&models.AlertRecord{})

	if isRead != "" {
		read, _ := strconv.ParseBool(isRead)
		query = query.Where("is_read = ?", read)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&alerts)

	c.JSON(http.StatusOK, utils.Success(map[string]interface{}{
		"list":      alerts,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func MarkAlertRead(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var alert models.AlertRecord
	if err := models.DB.First(&alert, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "预警记录不存在"))
		return
	}

	alert.IsRead = true
	if err := models.DB.Save(&alert).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新预警状态失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("预警已标记为已读", alert))
}

func MarkAllAlertsRead(c *gin.Context) {
	if err := models.DB.Model(&models.AlertRecord{}).Where("is_read = ?", false).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "批量更新预警状态失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("所有预警已标记为已读", nil))
}

func GetUnreadAlertCount(c *gin.Context) {
	var count int64
	models.DB.Model(&models.AlertRecord{}).Where("is_read = ?", false).Count(&count)

	c.JSON(http.StatusOK, utils.Success(map[string]interface{}{
		"unread_count": count,
	}))
}

func DeleteAlert(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var alert models.AlertRecord
	if err := models.DB.First(&alert, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "预警记录不存在"))
		return
	}

	if err := models.DB.Delete(&alert).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除预警记录失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("预警记录删除成功", nil))
}
