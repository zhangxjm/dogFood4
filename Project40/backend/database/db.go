package database

import (
	"fmt"
	"log"
	"fruit-store-backend/config"
	"fruit-store-backend/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	err = DB.AutoMigrate(&models.Category{}, &models.Product{})
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database initialized successfully")
	return nil
}

func SeedData() error {
	var categoryCount int64
	DB.Model(&models.Category{}).Count(&categoryCount)
	if categoryCount > 0 {
		return nil
	}

	categories := []models.Category{
		{Name: "新鲜水果"},
		{Name: "进口水果"},
		{Name: "时令水果"},
	}

	for _, cat := range categories {
		if err := DB.Create(&cat).Error; err != nil {
			log.Printf("Warning: Failed to create category %s: %v", cat.Name, err)
		}
	}

	products := []models.Product{
		{Name: "苹果", CategoryID: 1, Price: 5.99, Unit: "斤", Description: "红富士苹果"},
		{Name: "香蕉", CategoryID: 1, Price: 3.99, Unit: "斤", Description: "进口香蕉"},
		{Name: "橙子", CategoryID: 1, Price: 6.99, Unit: "斤", Description: "赣南脐橙"},
		{Name: "车厘子", CategoryID: 2, Price: 88.00, Unit: "斤", Description: "智利车厘子"},
		{Name: "草莓", CategoryID: 3, Price: 25.00, Unit: "斤", Description: "双流草莓"},
	}

	for _, p := range products {
		if err := DB.Create(&p).Error; err != nil {
			log.Printf("Warning: Failed to create product %s: %v", p.Name, err)
		}
	}

	log.Println("Seed data inserted successfully")
	return nil
}
