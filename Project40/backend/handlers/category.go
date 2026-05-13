package handlers

import (
	"fruit-store-backend/database"
	"fruit-store-backend/models"
	"github.com/gofiber/fiber/v2"
)

type CategoryResponse struct {
	Code    int             `json:"code"`
	Message string          `json:"message"`
	Data    []models.Category `json:"data,omitempty"`
}

type SingleCategoryResponse struct {
	Code    int           `json:"code"`
	Message string        `json:"message"`
	Data    models.Category `json:"data,omitempty"`
}

type CommonResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func GetCategories(c *fiber.Ctx) error {
	var categories []models.Category
	if err := database.DB.Order("id ASC").Find(&categories).Error; err != nil {
		return c.Status(500).JSON(&CommonResponse{
			Code:    500,
			Message: "获取分类列表失败",
		})
	}

	return c.Status(200).JSON(&CategoryResponse{
		Code:    200,
		Message: "success",
		Data:    categories,
	})
}

func GetCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		return c.Status(404).JSON(&CommonResponse{
			Code:    404,
			Message: "分类不存在",
		})
	}

	return c.Status(200).JSON(&SingleCategoryResponse{
		Code:    200,
		Message: "success",
		Data:    category,
	})
}

type CreateCategoryRequest struct {
	Name string `json:"name" validate:"required"`
}

func CreateCategory(c *fiber.Ctx) error {
	var req CreateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "参数错误",
		})
	}

	if req.Name == "" {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "分类名称不能为空",
		})
	}

	var existing models.Category
	if err := database.DB.Where("name = ?", req.Name).First(&existing).Error; err == nil {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "分类名称已存在",
		})
	}

	category := models.Category{Name: req.Name}
	if err := database.DB.Create(&category).Error; err != nil {
		return c.Status(500).JSON(&CommonResponse{
			Code:    500,
			Message: "创建分类失败",
		})
	}

	return c.Status(201).JSON(&SingleCategoryResponse{
		Code:    200,
		Message: "创建成功",
		Data:    category,
	})
}

type UpdateCategoryRequest struct {
	Name string `json:"name" validate:"required"`
}

func UpdateCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		return c.Status(404).JSON(&CommonResponse{
			Code:    404,
			Message: "分类不存在",
		})
	}

	var req UpdateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "参数错误",
		})
	}

	if req.Name == "" {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "分类名称不能为空",
		})
	}

	var existing models.Category
	if err := database.DB.Where("name = ? AND id != ?", req.Name, id).First(&existing).Error; err == nil {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "分类名称已存在",
		})
	}

	category.Name = req.Name
	if err := database.DB.Save(&category).Error; err != nil {
		return c.Status(500).JSON(&CommonResponse{
			Code:    500,
			Message: "更新分类失败",
		})
	}

	return c.Status(200).JSON(&SingleCategoryResponse{
		Code:    200,
		Message: "更新成功",
		Data:    category,
	})
}

func DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		return c.Status(404).JSON(&CommonResponse{
			Code:    404,
			Message: "分类不存在",
		})
	}

	var productCount int64
	database.DB.Model(&models.Product{}).Where("category_id = ?", id).Count(&productCount)
	if productCount > 0 {
		return c.Status(400).JSON(&CommonResponse{
			Code:    400,
			Message: "该分类下还有商品，无法删除",
		})
	}

	if err := database.DB.Delete(&category).Error; err != nil {
		return c.Status(500).JSON(&CommonResponse{
			Code:    500,
			Message: "删除分类失败",
		})
	}

	return c.Status(200).JSON(&CommonResponse{
		Code:    200,
		Message: "删除成功",
	})
}
