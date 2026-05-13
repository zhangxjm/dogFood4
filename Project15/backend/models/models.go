package models

import (
	"time"
)

type Room struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	Building    string     `json:"building" gorm:"not null"`
	Floor       int        `json:"floor" gorm:"not null"`
	RoomNumber  string     `json:"room_number" gorm:"not null;uniqueIndex:idx_room_unique"`
	Capacity    int        `json:"capacity" gorm:"default:4"`
	CurrentNum  int        `json:"current_num" gorm:"default:0"`
	Description string     `json:"description"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type Resident struct {
	ID         uint       `json:"id" gorm:"primaryKey"`
	RoomID     uint       `json:"room_id" gorm:"index"`
	Name       string     `json:"name" gorm:"not null"`
	StudentID  string     `json:"student_id" gorm:"uniqueIndex;not null"`
	Major      string     `json:"major"`
	Gender     string     `json:"gender"`
	Phone      string     `json:"phone"`
	CheckInAt  *time.Time `json:"check_in_at"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

type Utility struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	RoomID     uint      `json:"room_id" gorm:"not null;uniqueIndex:idx_utility_unique"`
	Month      string    `json:"month" gorm:"not null;uniqueIndex:idx_utility_unique"`
	Electricity float64  `json:"electricity"`
	Water      float64   `json:"water"`
	TotalCost  float64   `json:"total_cost"`
	Status     string    `json:"status" gorm:"default:'unpaid'"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
