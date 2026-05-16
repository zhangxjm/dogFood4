package controllers

import (
	"net/http"
	"pet-foster-backend/config"
	"pet-foster-backend/models"

	"github.com/gin-gonic/gin"
)

func GetStatistics(c *gin.Context) {
	var stats models.Statistics

	config.DB.Model(&models.Reservation{}).Count(&stats.TotalReservations)

	config.DB.Model(&models.Reservation{}).Where("status = ?", "pending").Count(&stats.PendingCount)
	config.DB.Model(&models.Reservation{}).Where("status = ?", "in_progress").Count(&stats.InProgressCount)
	config.DB.Model(&models.Reservation{}).Where("status = ?", "completed").Count(&stats.CompletedCount)

	type RevenueResult struct {
		Total float64
	}
	var revenueResult RevenueResult
	config.DB.Model(&models.Reservation{}).
		Select("COALESCE(SUM(total_price), 0) as total").
		Where("status = ?", "completed").
		Scan(&revenueResult)
	stats.TotalRevenue = revenueResult.Total

	type RatingResult struct {
		Avg float64
	}
	var ratingResult RatingResult
	config.DB.Model(&models.Review{}).
		Select("COALESCE(AVG(rating), 0) as avg").
		Scan(&ratingResult)
	stats.AverageRating = ratingResult.Avg

	type MonthlyResult struct {
		Month   string
		Count   int64
		Revenue float64
	}
	var monthlyResults []MonthlyResult
	config.DB.Model(&models.Reservation{}).
		Select("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue").
		Where("status = ?", "completed").
		Group("DATE_FORMAT(created_at, '%Y-%m')").
		Order("month DESC").
		Limit(12).
		Scan(&monthlyResults)

	for _, mr := range monthlyResults {
		stats.MonthlyReservations = append(stats.MonthlyReservations, models.MonthlyStat{
			Month:   mr.Month,
			Count:   mr.Count,
			Revenue: mr.Revenue,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}
