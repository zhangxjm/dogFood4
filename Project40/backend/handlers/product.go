package handlers

import (
	"fruit-store-backend/database"
	"fruit-store-backend/models"
	"github.com/gofiber/fiber/v2"
)

type ProductWithCategory struct {
	models.Product
	CategoryName string `json:"category_name"`
}

type ProductsResponse struct {
	Code    int                 `json:"code"`
	Message string              `json:"message"`
	Data    []ProductWithCategory `json:"data,omitempty"`
}

type SingleProductResponse struct {
	Code    int                 `json:"code"`
	Message string              `json:"message"`
	Data    *ProductWithCategory `json:"data,omitempty"`
}

func GetProducts(c *fiber.Ctx) error {
	categoryID := c.Query("category_id")

	query := `
		SELECT p.*, c.name as category_name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
	`

	var products []ProductWithCategory
	if categoryID != "" {
		query += " WHERE p.category_id = ?"
		database.DB.Raw(query+" ORDER BY p.id DESC", categoryID).Scan(&products)
	} else {
		database.DB.Raw(query + " ORDER BY p.id DESC").Scan(&products)
	}

	return c.Status(200).JSON(&ProductsResponse{
		Code:    200,
		Message: "success",
		Data:    products,
	})
}

func GetProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	var product ProductWithCategory
	result := database.DB.Raw(`
		SELECT p.*, c.name as category_name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.id = ?
	`, id).Scan(&product)

	if result.Error != nil || product.ID == 0 {
		return c.Status(404).JSON(&CommonResponse{
			Code:    404,
			Message: "商品不存在",
		})
	}

	return c.Status(200).JSON(&SingleProductResponse{
		Code:    200,
		Message: "success",
		Data:    &product,
	})
}

type CreateProductRequest struct {
	Name        string  `json:"name"`
	CategoryID  uint    `json:"category_id"`
	Price       float64 `json:"price"`
	Unit        string  `json:"unit"`
	Description string  `json:"description"`
}

func CreateProduct(c *fiber.Ctx) error {
	var req CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "参数错误",
		})
	}

	if req.Name == "" {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "商品名称不能为空",
		})
	}

	if req.CategoryID == 0 {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "请选择商品分类",
		})
	}

	if req.Price <= 0 {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "商品价格必须大于0",
		})
	}

	var category models.Category
	if err := database.DB.First(&category, req.CategoryID).Error; err != nil {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "分类不存在",
		})
	}

	unit := req.Unit
	if unit == "" {
		unit = "斤"
	}

	product := models.Product{
		Name:        req.Name,
		CategoryID:  req.CategoryID,
		Price:       req.Price,
		Unit:        unit,
		Description: req.Description,
	}

	if err := database.DB.Create(&product).Error; err != nil {
		return c.Status(500).JSON(&CommonResponse{
			Code:    500,
			Message: "创建商品失败",
		})
	}

	return c.Status(201).JSON(&CommonResponse{
		Code:    200,
		Message: "创建成功",
	})
}

type UpdateProductRequest struct {
	Name        string  `json:"name"`
	CategoryID  uint    `json:"category_id"`
	Price       float64 `json:"price"`
	Unit        string  `json:"unit"`
	Description string  `json:"description"`
}

func UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		return c.Status(404).JSON(&CommonResponse{
			Code:    404,
			Message: "商品不存在",
		})
	}

	var req UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "参数错误",
		})
	}

	if req.Name != "" {
		product.Name = req.Name
	}

	if req.CategoryID != 0 {
		var category models.Category
		if err := database.DB.First(&category, req.CategoryID).Error; err != nil {
			return c.Status(400).JSON(&CommonResponse{
				Code:    400,
				Message: "分类不存在",
			})
		}
		product.CategoryID = req.CategoryID
	}

	if req.Price > 0 {
		product.Price = req.Price
	}

	if req.Unit != "" {
		product.Unit = req.Unit
	}

	if req.Description != "" {
		product.Description = req.Description
	}

	if err := database.DB.Save(&product).Error; err != nil {
		return c.Status(500).JSON(&CommonResponse{
			Code:    500,
			Message: "更新商品失败",
		})
	}

	return c.Status(200).JSON(&CommonResponse{
		Code:    200,
		Message: "更新成功",
	})
}

func DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		return c.Status(404).JSON(&CommonResponse{
			Code:    404,
			Message: "商品不存在",
		})
	}

	if err := database.DB.Delete(&product).Error; err != nil {
		return c.Status(500).JSON(&CommonResponse{
			Code:    500,
			Message: "删除商品失败",
		})
	}

	return c.Status(200).JSON(&CommonResponse{
		Code:    200,
		Message: "删除成功",
	})
}
