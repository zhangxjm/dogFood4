package models

import (
	"gorm.io/gorm"
	"petshop/config"
)

type Pet struct {
	gorm.Model
	Name        string    `json:"name" gorm:"not null"`
	Type        string    `json:"type" gorm:"not null"`
	Breed       string    `json:"breed"`
	Gender      string    `json:"gender"`
	BirthDate   string    `json:"birth_date"`
	OwnerID     uint      `json:"owner_id"`
	Owner       Owner     `json:"owner" gorm:"foreignKey:OwnerID"`
	Vaccines    []Vaccine `json:"vaccines" gorm:"foreignKey:PetID"`
	Description string    `json:"description"`
}

func Migrate() {
	config.DB.AutoMigrate(&Owner{}, &Pet{}, &Vaccine{})
}
