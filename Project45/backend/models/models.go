package models

import (
	"fmt"
	"log"
	"time"
	"warehouse-management/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

type Product struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	SKU          string    `gorm:"uniqueIndex;size:50;not null" json:"sku"`
	Name         string    `gorm:"size:200;not null" json:"name"`
	Category     string    `gorm:"size:100" json:"category"`
	Unit         string    `gorm:"size:20" json:"unit"`
	Price        float64   `gorm:"type:decimal(10,2)" json:"price"`
	Stock        int       `gorm:"default:0" json:"stock"`
	MinStock     int       `gorm:"default:10" json:"min_stock"`
	Description  string    `gorm:"type:text" json:"description"`
	IsLowStock   bool      `gorm:"default:false" json:"is_low_stock"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type InboundRecord struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ProductID    uint      `gorm:"index;not null" json:"product_id"`
	ProductSKU   string    `gorm:"size:50" json:"product_sku"`
	ProductName  string    `gorm:"size:200" json:"product_name"`
	Quantity     int       `gorm:"not null" json:"quantity"`
	Supplier     string    `gorm:"size:200" json:"supplier"`
	Operator     string    `gorm:"size:100" json:"operator"`
	Remark       string    `gorm:"type:text" json:"remark"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type OutboundRecord struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ProductID    uint      `gorm:"index;not null" json:"product_id"`
	ProductSKU   string    `gorm:"size:50" json:"product_sku"`
	ProductName  string    `gorm:"size:200" json:"product_name"`
	Quantity     int       `gorm:"not null" json:"quantity"`
	Customer     string    `gorm:"size:200" json:"customer"`
	Operator     string    `gorm:"size:100" json:"operator"`
	Remark       string    `gorm:"type:text" json:"remark"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type AlertRecord struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ProductID    uint      `gorm:"index;not null" json:"product_id"`
	ProductSKU   string    `gorm:"size:50" json:"product_sku"`
	ProductName  string    `gorm:"size:200" json:"product_name"`
	CurrentStock int       `gorm:"not null" json:"current_stock"`
	MinStock     int       `gorm:"not null" json:"min_stock"`
	AlertMessage string    `gorm:"size:500" json:"alert_message"`
	IsRead       bool      `gorm:"default:false" json:"is_read"`
	CreatedAt    time.Time `json:"created_at"`
}

func InitDB() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=%s&parseTime=True&loc=Local",
		config.AppConfig.Database.Username,
		config.AppConfig.Database.Password,
		config.AppConfig.Database.Host,
		config.AppConfig.Database.Port,
		config.AppConfig.Database.Charset,
	)

	tempDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to MySQL server: %v", err)
	}

	dbName := config.AppConfig.Database.DBName
	tempDB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", dbName))

	dsnWithDB := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local",
		config.AppConfig.Database.Username,
		config.AppConfig.Database.Password,
		config.AppConfig.Database.Host,
		config.AppConfig.Database.Port,
		dbName,
		config.AppConfig.Database.Charset,
	)

	DB, err = gorm.Open(mysql.Open(dsnWithDB), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")

	DB.AutoMigrate(&Product{}, &InboundRecord{}, &OutboundRecord{}, &AlertRecord{})
	log.Println("Database migration completed")
}
