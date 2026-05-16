package controllers

import (
	"net/http"
	"strconv"
	"warehouse-management/models"
	"warehouse-management/utils"

	"github.com/gin-gonic/gin"
)

func GetOutboundRecords(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var records []models.OutboundRecord
	var total int64

	query := models.DB.Model(&models.OutboundRecord{})

	if keyword != "" {
		query = query.Where("product_sku LIKE ? OR product_name LIKE ? OR customer LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
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

func CreateOutbound(c *gin.Context) {
	var record models.OutboundRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误: "+err.Error()))
		return
	}

	if record.Quantity <= 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "出库数量必须大于0"))
		return
	}

	var product models.Product
	if err := models.DB.First(&product, record.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "商品不存在"))
		return
	}

	if product.Stock < record.Quantity {
		c.JSON(http.StatusBadRequest, utils.Error(400, "库存不足，当前库存: "+strconv.Itoa(product.Stock)))
		return
	}

	record.ProductSKU = product.SKU
	record.ProductName = product.Name

	tx := models.DB.Begin()

	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "出库记录创建失败: "+err.Error()))
		return
	}

	product.Stock -= record.Quantity
	product.IsLowStock = product.Stock <= product.MinStock

	if err := tx.Save(&product).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "库存更新失败: "+err.Error()))
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, utils.SuccessWithMessage("出库成功", record))
}

func DeleteOutbound(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var record models.OutboundRecord
	if err := models.DB.First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "出库记录不存在"))
		return
	}

	tx := models.DB.Begin()

	var product models.Product
	if err := tx.First(&product, record.ProductID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, utils.Error(404, "关联商品不存在"))
		return
	}

	product.Stock += record.Quantity
	product.IsLowStock = product.Stock <= product.MinStock

	if err := tx.Save(&product).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "库存更新失败: "+err.Error()))
		return
	}

	if err := tx.Delete(&record).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "出库记录删除失败: "+err.Error()))
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, utils.SuccessWithMessage("出库记录删除成功", nil))
}

func GetOutboundStatistics(c *gin.Context) {
	var count int64
	var totalQuantity int64

	models.DB.Model(&models.OutboundRecord{}).Count(&count)
	models.DB.Model(&models.OutboundRecord{}).Select("COALESCE(SUM(quantity), 0)").Scan(&totalQuantity)

	c.JSON(http.StatusOK, utils.Success(map[string]interface{}{
		"total_count":     count,
		"total_quantity":  totalQuantity,
	}))
}
