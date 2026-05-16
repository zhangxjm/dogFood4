package controllers

import (
	"net/http"
	"strconv"
	"warehouse-management/models"
	"warehouse-management/utils"

	"github.com/gin-gonic/gin"
)

func GetInboundRecords(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var records []models.InboundRecord
	var total int64

	query := models.DB.Model(&models.InboundRecord{})

	if keyword != "" {
		query = query.Where("product_sku LIKE ? OR product_name LIKE ? OR supplier LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if startDate != "" {
		query = query.Where("created_at >= ?", startDate+" 00:00:00")
	}

	if endDate != "" {
		query = query.Where("created_at <= ?", endDate+" 23:59:59")
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&records)

	c.JSON(http.StatusOK, utils.Success(map[string]interface{}{
		"list":      records,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func CreateInbound(c *gin.Context) {
	var record models.InboundRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误: "+err.Error()))
		return
	}

	if record.Quantity <= 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "入库数量必须大于0"))
		return
	}

	var product models.Product
	if err := models.DB.First(&product, record.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "商品不存在"))
		return
	}

	record.ProductSKU = product.SKU
	record.ProductName = product.Name

	tx := models.DB.Begin()

	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "入库记录创建失败: "+err.Error()))
		return
	}

	product.Stock += record.Quantity
	product.IsLowStock = product.Stock <= product.MinStock

	if err := tx.Save(&product).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "库存更新失败: "+err.Error()))
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, utils.SuccessWithMessage("入库成功", record))
}

func DeleteInbound(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var record models.InboundRecord
	if err := models.DB.First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "入库记录不存在"))
		return
	}

	tx := models.DB.Begin()

	var product models.Product
	if err := tx.First(&product, record.ProductID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, utils.Error(404, "关联商品不存在"))
		return
	}

	if product.Stock < record.Quantity {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, utils.Error(400, "库存不足，无法回滚入库"))
		return
	}

	product.Stock -= record.Quantity
	product.IsLowStock = product.Stock <= product.MinStock

	if err := tx.Save(&product).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "库存更新失败: "+err.Error()))
		return
	}

	if err := tx.Delete(&record).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "入库记录删除失败: "+err.Error()))
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, utils.SuccessWithMessage("入库记录删除成功", nil))
}

func GetInboundStatistics(c *gin.Context) {
	var count int64
	var totalQuantity int64

	models.DB.Model(&models.InboundRecord{}).Count(&count)
	models.DB.Model(&models.InboundRecord{}).Select("COALESCE(SUM(quantity), 0)").Scan(&totalQuantity)

	c.JSON(http.StatusOK, utils.Success(map[string]interface{}{
		"total_count":     count,
		"total_quantity":  totalQuantity,
	}))
}
