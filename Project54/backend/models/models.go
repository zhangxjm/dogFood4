package models

import (
	"time"
)

type Package struct {
	ID           uint      `gorm:"primary_key" json:"id"`
	Name         string    `gorm:"size:100;not null" json:"name"`
	Description  string    `gorm:"type:text" json:"description"`
	Price        float64   `gorm:"type:decimal(10,2);not null" json:"price"`
	DurationDays int       `gorm:"not null" json:"durationDays"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Pet struct {
	ID          uint      `gorm:"primary_key" json:"id"`
	OwnerName   string    `gorm:"size:100;not null" json:"ownerName"`
	OwnerPhone  string    `gorm:"size:20;not null" json:"ownerPhone"`
	PetName     string    `gorm:"size:100;not null" json:"petName"`
	PetType     string    `gorm:"size:50;not null" json:"petType"`
	Breed       string    `gorm:"size:100" json:"breed"`
	Age         int       `json:"age"`
	Weight      float64   `gorm:"type:decimal(5,2)" json:"weight"`
	HealthInfo  string    `gorm:"type:text" json:"healthInfo"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Reservation struct {
	ID              uint      `gorm:"primary_key" json:"id"`
	PetID           uint      `gorm:"not null" json:"petId"`
	PackageID       uint      `gorm:"not null" json:"packageId"`
	StartDate       string    `gorm:"type:date;not null" json:"startDate"`
	EndDate         string    `gorm:"type:date;not null" json:"endDate"`
	Status          string    `gorm:"size:20;default:'pending'" json:"status"`
	SpecialRequests string    `gorm:"type:text" json:"specialRequests"`
	TotalPrice      float64   `gorm:"type:decimal(10,2);not null" json:"totalPrice"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
	Pet             Pet       `gorm:"foreignKey:PetID" json:"pet,omitempty"`
	Package         Package   `gorm:"foreignKey:PackageID" json:"package,omitempty"`
}

type Review struct {
	ID            uint      `gorm:"primary_key" json:"id"`
	ReservationID uint      `gorm:"not null;unique" json:"reservationId"`
	Rating        int       `gorm:"not null" json:"rating"`
	Comment       string    `gorm:"type:text" json:"comment"`
	CreatedAt     time.Time `json:"createdAt"`
	Reservation   Reservation `gorm:"foreignKey:ReservationID" json:"reservation,omitempty"`
}

type Statistics struct {
	TotalReservations     int64         `json:"totalReservations"`
	PendingCount          int64         `json:"pendingCount"`
	InProgressCount       int64         `json:"inProgressCount"`
	CompletedCount        int64         `json:"completedCount"`
	TotalRevenue          float64       `json:"totalRevenue"`
	AverageRating         float64       `json:"averageRating"`
	MonthlyReservations   []MonthlyStat `json:"monthlyReservations"`
}

type MonthlyStat struct {
	Month        string  `json:"month"`
	Count        int64   `json:"count"`
	Revenue      float64 `json:"revenue"`
}
