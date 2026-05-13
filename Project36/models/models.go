package models

import (
	"time"
)

type Worker struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:50;not null" json:"name"`
	WorkerNo    string    `gorm:"size:20;unique;not null" json:"worker_no"`
	Phone       string    `gorm:"size:20" json:"phone"`
	Department  string    `gorm:"size:50" json:"department"`
	Position    string    `gorm:"size:50" json:"position"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type AttendanceRecord struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	WorkerID   uint      `gorm:"not null;index" json:"worker_id"`
	Worker     Worker    `gorm:"foreignKey:WorkerID" json:"worker"`
	Date       time.Time `gorm:"type:date;not null;index" json:"date"`
	CheckIn    string    `gorm:"size:10" json:"check_in"`
	CheckOut   string    `gorm:"size:10" json:"check_out"`
	Status     string    `gorm:"size:20;default:'正常'" json:"status"`
	Remark     string    `gorm:"size:200" json:"remark"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
