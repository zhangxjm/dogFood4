package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Owner struct {
	ID          string    `json:"id" gorm:"primaryKey;type:char(36)"`
	Name        string    `json:"name" gorm:"not null"`
	Phone       string    `json:"phone" gorm:"not null"`
	Address     string    `json:"address"`
	Note        string    `json:"note"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Vehicles    []Vehicle `json:"vehicles,omitempty" gorm:"foreignKey:OwnerID;constraint:OnDelete:CASCADE"`
	ParkingSpot *ParkingSpot `json:"parking_spot,omitempty" gorm:"foreignKey:OwnerID;constraint:OnDelete:SET NULL"`
}

type Vehicle struct {
	ID            string    `json:"id" gorm:"primaryKey;type:char(36)"`
	PlateNumber   string    `json:"plate_number" gorm:"not null;uniqueIndex"`
	OwnerID       string    `json:"owner_id" gorm:"type:char(36);index"`
	VehicleType   string    `json:"vehicle_type"`
	Color         string    `json:"color"`
	Brand         string    `json:"brand"`
	Model         string    `json:"model"`
	Note          string    `json:"note"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	Owner         *Owner    `json:"owner,omitempty" gorm:"-"`
}

type ParkingSpot struct {
	ID          string    `json:"id" gorm:"primaryKey;type:char(36)"`
	SpotNumber  string    `json:"spot_number" gorm:"not null;uniqueIndex"`
	Location    string    `json:"location"`
	OwnerID     *string   `json:"owner_id" gorm:"type:char(36);uniqueIndex"`
	Note        string    `json:"note"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Owner       *Owner    `json:"owner,omitempty" gorm:"-"`
}

func (o *Owner) BeforeCreate(tx *gorm.DB) error {
	if o.ID == "" {
		o.ID = uuid.New().String()
	}
	return nil
}

func (v *Vehicle) BeforeCreate(tx *gorm.DB) error {
	if v.ID == "" {
		v.ID = uuid.New().String()
	}
	return nil
}

func (p *ParkingSpot) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}
