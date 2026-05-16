package controllers

import (
	"net/http"
	"strconv"
	"warehouse-management/models"
	"warehouse-management/utils"

	"github.com/gin-gonic/gin"
)

func GetInventoryList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	category := c.Query("category")
	lowStockOnly := c.Query("low_stock")

	var products []models.Product
	var total int64

	query := models.DB.Model(&models.Product{})

	if keyword != "" {
		query = query.Where("name LIKE ? OR sku LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	if category != "" {
		query = query.Where("category = ?", category)
	}

	if lowStockOnly == "true" {
		query = query.Where("is_low_stock = ?", true)
	}

	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "查询失败: "+err.Error()))
		return
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("stock ASC, created_at DESC").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "查询失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.Success(map[string]interface{}{
		"list":      products,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func GetInventoryStatistics(c *gin.Context) {
	var totalProducts int64
	var totalStock int64
	var lowStockCount int64
	var totalValue float64

	if err := models.DB.Model(&models.Product{}).Count(&totalProducts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "查询失败: "+err.Error()))
		return
	}

	type StockSum struct {
		Sum int64
	}
	var stockSum StockSum
	if err := models.DB.Model(&models.Product{}).Select("IFNULL(SUM(stock), 0) as sum").Scan(&stockSum).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "查询失败: "+err.Error()))
		return
	}
	totalStock = stockSum.Sum

	if err := models.DB.Model(&models.Product{}).Where("is_low_stock = ?", true).Count(&lowStockCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "查询失败: "+err.Error()))
		return
	}

	type ValueSum struct {
		Sum float64
	}
	var valueSum ValueSum
	if err := models.DB.Model(&models.Product{}).Select("IFNULL(SUM(stock * price), 0) as sum").Scan(&valueSum).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "查询失败: "+err.Error()))
		return
	}
	totalValue = valueSum.Sum

	c.JSON(http.StatusOK, utils.Success(map[string]interface{}{
		"total_products":  totalProducts,
		"total_stock":     totalStock,
		"low_stock_count": lowStockCount,
		"total_value":     totalValue,
	}))
}

func GetTransactionStatistics(c *gin.Context) {
	var inboundCount int64
	var outboundCount int64
	var inboundQuantity int64
	var outboundQuantity int64

	if err := models.DB.Model(&models.InboundRecord{}).Count(&inboundCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "查询失败: "+err.Error()))
		return
	}

	if err := models.DB.Model(&models.OutboundRecord{}).Count(&outboundCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "查询失败: "+err.Error()))
		return
	}

	type QuantitySum struct {
		Sum int64
	}
	var inboundSum QuantitySum
	if err := models.DB.Model(&models.InboundRecord{}).Select("IFNULL(SUM(quantity), 0) as sum").Scan(&inboundSum).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "查询失败: "+err.Error()))
		return
	}
	inboundQuantity = inboundSum.Sum

	var outboundSum QuantitySum
	if err := models.DB.Model(&models.OutboundRecord{}).Select("IFNULL(SUM(quantity), 0) as sum").Scan(&outboundSum).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "查询失败: "+err.Error()))
		return
	}
	outboundQuantity = outboundSum.Sum

	c.JSON(http.StatusOK, utils.Success(map[string]interface{}{
		"inbound_count":    inboundCount,
		"outbound_count":   outboundCount,
		"inbound_quantity": inboundQuantity,
		"outbound_quantity": outboundQuantity,
		"net_quantity":     inboundQuantity - outboundQuantity,
	}))
}

func GetAllRecords(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	recordType := c.Query("type")

	type RecordItem struct {
		ID           uint   `json:"id"`
		Type         string `json:"type"`
		ProductID    uint   `json:"product_id"`
		ProductSKU   string `json:"product_sku"`
		ProductName  string `json:"product_name"`
		Quantity     int    `json:"quantity"`
		Supplier     string `json:"supplier,omitempty"`
		Customer     string `json:"customer,omitempty"`
		Operator     string `json:"operator"`
		Remark       string `json:"remark"`
		CreatedAt    string `json:"created_at"`
	}

	var inbounds []models.InboundRecord
	var outbounds []models.OutboundRecord

	inboundQuery := models.DB.Model(&models.InboundRecord{})
	outboundQuery := models.DB.Model(&models.OutboundRecord{})

	if keyword != "" {
		inboundQuery = inboundQuery.Where("product_sku LIKE ? OR product_name LIKE ? OR supplier LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
		outboundQuery = outboundQuery.Where("product_sku LIKE ? OR product_name LIKE ? OR customer LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if startDate != "" {
		inboundQuery = inboundQuery.Where("created_at >= ?", startDate+" 00:00:00")
		outboundQuery = outboundQuery.Where("created_at >= ?", startDate+" 00:00:00")
	}

	if endDate != "" {
		inboundQuery = inboundQuery.Where("created_at <= ?", endDate+" 23:59:59")
		outboundQuery = outboundQuery.Where("created_at <= ?", endDate+" 23:59:59")
	}

	if recordType == "" || recordType == "inbound" {
		inboundQuery.Order("created_at DESC").Find(&inbounds)
	}

	if recordType == "" || recordType == "outbound" {
		outboundQuery.Order("created_at DESC").Find(&outbounds)
	}

	var allRecords []RecordItem

	for _, inbound := range inbounds {
		allRecords = append(allRecords, RecordItem{
			ID:          inbound.ID,
			Type:        "inbound",
			ProductID:   inbound.ProductID,
			ProductSKU:  inbound.ProductSKU,
			ProductName: inbound.ProductName,
			Quantity:    inbound.Quantity,
			Supplier:    inbound.Supplier,
			Operator:    inbound.Operator,
			Remark:      inbound.Remark,
			CreatedAt:   inbound.CreatedAt.String(),
		})
	}

	for _, outbound := range outbounds {
		allRecords = append(allRecords, RecordItem{
			ID:          outbound.ID,
			Type:        "outbound",
			ProductID:   outbound.ProductID,
			ProductSKU:  outbound.ProductSKU,
			ProductName: outbound.ProductName,
			Quantity:    outbound.Quantity,
			Customer:    outbound.Customer,
			Operator:    outbound.Operator,
			Remark:      outbound.Remark,
			CreatedAt:   outbound.CreatedAt.String(),
		})
	}

	total := int64(len(allRecords))

	startIndex := (page - 1) * pageSize
	endIndex := startIndex + pageSize
	if startIndex > len(allRecords) {
		startIndex = len(allRecords)
	}
	if endIndex > len(allRecords) {
		endIndex = len(allRecords)
	}

	pagedRecords := allRecords[startIndex:endIndex]

	c.JSON(http.StatusOK, utils.Success(map[string]interface{}{
		"list":      pagedRecords,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}
