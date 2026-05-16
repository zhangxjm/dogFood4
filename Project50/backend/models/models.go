package models

import (
	"time"
)

type Book struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Author      string    `json:"author" gorm:"not null"`
	ISBN        string    `json:"isbn" gorm:"unique"`
	Category    string    `json:"category"`
	Quantity    int       `json:"quantity" gorm:"default:1"`
	Available   int       `json:"available" gorm:"default:1"`
	Location    string    `json:"location"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Reader struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Phone     string    `json:"phone" gorm:"unique"`
	Email     string    `json:"email" gorm:"unique"`
	IDCard    string    `json:"id_card" gorm:"unique"`
	Type      string    `json:"type" gorm:"default:'普通读者'"`
	MaxBorrow int       `json:"max_borrow" gorm:"default:5"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type BorrowRecord struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	BookID     uint      `json:"book_id" gorm:"not null"`
	ReaderID   uint      `json:"reader_id" gorm:"not null"`
	BorrowDate string    `json:"borrow_date" gorm:"type:date;not null"`
	DueDate    string    `json:"due_date" gorm:"type:date;not null"`
	ReturnDate string    `json:"return_date" gorm:"type:date"`
	Status     string    `json:"status" gorm:"default:'借阅中'"`
	FineAmount float64   `json:"fine_amount" gorm:"type:decimal(10,2);default:0"`
	FinePaid   bool      `json:"fine_paid" gorm:"default:false"`
	Book       Book      `json:"book" gorm:"foreignKey:BookID"`
	Reader     Reader    `json:"reader" gorm:"foreignKey:ReaderID"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type BorrowRequest struct {
	BookID   uint `json:"book_id"`
	ReaderID uint `json:"reader_id"`
	Days     int  `json:"days"`
}

type ReturnRequest struct {
	RecordID uint `json:"record_id"`
}

type Statistics struct {
	TotalBooks       int64       `json:"total_books"`
	TotalReaders     int64       `json:"total_readers"`
	BorrowingCount   int64       `json:"borrowing_count"`
	TotalBorrowCount int64       `json:"total_borrow_count"`
	TotalFine        float64     `json:"total_fine"`
	BookRankings     []BookRanking `json:"book_rankings"`
}

type BookRanking struct {
	BookID      uint   `json:"book_id"`
	Title       string `json:"title"`
	BorrowCount int64  `json:"borrow_count"`
}
