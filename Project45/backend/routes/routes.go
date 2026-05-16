package routes

import (
	"warehouse-management/controllers"
	"warehouse-management/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.Use(middleware.Cors())

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"code":    200,
				"message": "success",
				"data": gin.H{
					"status": "ok",
				},
			})
		})

		products := api.Group("/products")
		{
			products.GET("", controllers.GetProducts)
			products.GET("/categories", controllers.GetProductCategories)
			products.GET("/:id", controllers.GetProduct)
			products.POST("", controllers.CreateProduct)
			products.PUT("/:id", controllers.UpdateProduct)
			products.DELETE("/:id", controllers.DeleteProduct)
		}

		inbound := api.Group("/inbound")
		{
			inbound.GET("", controllers.GetInboundRecords)
			inbound.POST("", controllers.CreateInbound)
			inbound.DELETE("/:id", controllers.DeleteInbound)
			inbound.GET("/statistics", controllers.GetInboundStatistics)
		}

		outbound := api.Group("/outbound")
		{
			outbound.GET("", controllers.GetOutboundRecords)
			outbound.POST("", controllers.CreateOutbound)
			outbound.DELETE("/:id", controllers.DeleteOutbound)
			outbound.GET("/statistics", controllers.GetOutboundStatistics)
		}

		inventory := api.Group("/inventory")
		{
			inventory.GET("", controllers.GetInventoryList)
			inventory.GET("/statistics", controllers.GetInventoryStatistics)
			inventory.GET("/transactions", controllers.GetTransactionStatistics)
			inventory.GET("/records", controllers.GetAllRecords)
		}

		alerts := api.Group("/alerts")
		{
			alerts.GET("", controllers.GetAlerts)
			alerts.GET("/unread-count", controllers.GetUnreadAlertCount)
			alerts.PUT("/:id/read", controllers.MarkAlertRead)
			alerts.PUT("/read-all", controllers.MarkAllAlertsRead)
			alerts.DELETE("/:id", controllers.DeleteAlert)
		}
	}
}
