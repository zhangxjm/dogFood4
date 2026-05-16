package controllers

import (
	"net/http"
	"strconv"
	"warehouse-management/models"
	"warehouse-management/utils"

	"github.com/gin-gonic/gin"
)

func GetProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	category := c.Query("category")

	var products []models.Product
	var total int64

	query := models.DB.Model(&models.Product{})

	if keyword != "" {
		query = query.Where("name LIKE ? OR sku LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	if category != "" {
		query = query.Where("category = ?", category)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&products)

	c.JSON(http.StatusOK, utils.Success(map[string]interface{}{
		"list":      products,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func GetProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var product models.Product
	if err := models.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "商品不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(product))
}

func CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误: "+err.Error()))
		return
	}

	product.IsLowStock = product.Stock <= product.MinStock

	if err := models.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建商品失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("商品创建成功", product))
}

func UpdateProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var existingProduct models.Product
	if err := models.DB.First(&existingProduct, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "商品不存在"))
		return
	}

	var productData models.Product
	if err := c.ShouldBindJSON(&productData); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误: "+err.Error()))
		return
	}

	productData.IsLowStock = productData.Stock <= productData.MinStock

	if err := models.DB.Model(&existingProduct).Updates(&productData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新商品失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("商品更新成功", existingProduct))
}

func DeleteProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var product models.Product
	if err := models.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "商品不存在"))
		return
	}

	if err := models.DB.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除商品失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("商品删除成功", nil))
}

func GetProductCategories(c *gin.Context) {
	var categories []string
	models.DB.Model(&models.Product{}).Distinct("category").Where("category != ''").Pluck("category", &categories)

	c.JSON(http.StatusOK, utils.Success(categories))
}
