package utils

import (
	"fmt"
	"log"
	"time"
	"warehouse-management/models"

	"github.com/robfig/cron/v3"
)

func InitScheduler() {
	c := cron.New()

	c.AddFunc("0 */5 * * * *", CheckStockAlert)

	c.Start()

	log.Println("Scheduler started, stock alert check every 5 minutes")

	go CheckStockAlert()
}

func CheckStockAlert() {
	log.Printf("Checking stock alerts at %v...", time.Now())

	var products []models.Product
	models.DB.Find(&products)

	for _, product := range products {
		if product.Stock <= product.MinStock && !product.IsLowStock {
			models.DB.Model(&product).Update("is_low_stock", true)

			alertMsg := fmt.Sprintf("库存不足，当前库存: %d，最低库存: %d", product.Stock, product.MinStock)
			alert := models.AlertRecord{
				ProductID:    product.ID,
				ProductSKU:   product.SKU,
				ProductName:  product.Name,
				CurrentStock: product.Stock,
				MinStock:     product.MinStock,
				AlertMessage: alertMsg,
				IsRead:       false,
				CreatedAt:    time.Now(),
			}
			models.DB.Create(&alert)

			log.Printf("Stock alert created for product: %s (SKU: %s)", product.Name, product.SKU)
		} else if product.Stock > product.MinStock && product.IsLowStock {
			models.DB.Model(&product).Update("is_low_stock", false)
		}
	}
}
