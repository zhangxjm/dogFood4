package controllers

import (
	"library-system/database"
	"library-system/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

const FinePerDay = 0.5

func GetBorrowRecords(c *fiber.Ctx) error {
	var records []models.BorrowRecord
	database.DB.Preload("Book").Preload("Reader").Find(&records)
	return c.JSON(fiber.Map{"data": records})
}

func CreateBorrow(c *fiber.Ctx) error {
	req := new(models.BorrowRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	var book models.Book
	if result := database.DB.First(&book, req.BookID); result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Book not found"})
	}

	if book.Available <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Book not available"})
	}

	var reader models.Reader
	if result := database.DB.First(&reader, req.ReaderID); result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Reader not found"})
	}

	var borrowingCount int64
	database.DB.Model(&models.BorrowRecord{}).Where("reader_id = ? AND status = ?", req.ReaderID, "借阅中").Count(&borrowingCount)
	if int(borrowingCount) >= reader.MaxBorrow {
		return c.Status(400).JSON(fiber.Map{"error": "Reader has reached maximum borrow limit"})
	}

	borrowDate := time.Now()
	days := req.Days
	if days <= 0 {
		days = 30
	}
	dueDate := borrowDate.AddDate(0, 0, days)

	record := models.BorrowRecord{
		BookID:     req.BookID,
		ReaderID:   req.ReaderID,
		BorrowDate: borrowDate.Format("2006-01-02"),
		DueDate:    dueDate.Format("2006-01-02"),
		Status:     "借阅中",
	}

	tx := database.DB.Begin()
	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	book.Available--
	if err := tx.Save(&book).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	tx.Commit()
	return c.JSON(fiber.Map{"message": "Borrow created successfully", "data": record})
}

func ReturnBook(c *fiber.Ctx) error {
	req := new(models.ReturnRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	var record models.BorrowRecord
	if result := database.DB.First(&record, req.RecordID); result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Borrow record not found"})
	}

	if record.Status == "已归还" {
		return c.Status(400).JSON(fiber.Map{"error": "Book already returned"})
	}

	returnDate := time.Now()
	record.ReturnDate = returnDate.Format("2006-01-02")
	record.Status = "已归还"

	dueDate, _ := time.Parse("2006-01-02", record.DueDate)
	if returnDate.After(dueDate) {
		overdueDays := int(returnDate.Sub(dueDate).Hours() / 24)
		record.FineAmount = float64(overdueDays) * FinePerDay
	}

	tx := database.DB.Begin()
	if err := tx.Save(&record).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	var book models.Book
	if result := tx.First(&book, record.BookID); result.Error == nil {
		book.Available++
		tx.Save(&book)
	}

	tx.Commit()
	return c.JSON(fiber.Map{"message": "Book returned successfully", "data": record})
}

func PayFine(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" || id == "undefined" {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid borrow record ID"})
	}
	var record models.BorrowRecord
	if result := database.DB.First(&record, id); result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Borrow record not found"})
	}

	record.FinePaid = true
	database.DB.Save(&record)
	return c.JSON(fiber.Map{"message": "Fine paid successfully", "data": record})
}

func GetStatistics(c *fiber.Ctx) error {
	var stats models.Statistics

	database.DB.Model(&models.Book{}).Count(&stats.TotalBooks)
	database.DB.Model(&models.Reader{}).Count(&stats.TotalReaders)
	database.DB.Model(&models.BorrowRecord{}).Where("status = ?", "借阅中").Count(&stats.BorrowingCount)
	database.DB.Model(&models.BorrowRecord{}).Count(&stats.TotalBorrowCount)

	var totalFine float64
	rows, _ := database.DB.Model(&models.BorrowRecord{}).Select("COALESCE(SUM(fine_amount), 0)").Rows()
	if rows.Next() {
		rows.Scan(&totalFine)
	}
	stats.TotalFine = totalFine

	type RankingResult struct {
		BookID      uint
		Title       string
		BorrowCount int64
	}
	var rankings []RankingResult

	database.DB.Raw(`
		SELECT br.book_id, b.title, COUNT(*) as borrow_count
		FROM borrow_records br
		JOIN books b ON br.book_id = b.id
		GROUP BY br.book_id, b.title
		ORDER BY borrow_count DESC
		LIMIT 10
	`).Scan(&rankings)

	for _, r := range rankings {
		stats.BookRankings = append(stats.BookRankings, models.BookRanking{
			BookID:      r.BookID,
			Title:       r.Title,
			BorrowCount: r.BorrowCount,
		})
	}

	return c.JSON(fiber.Map{"data": stats})
}
