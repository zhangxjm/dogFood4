package models

import "gorm.io/gorm"

type Vaccine struct {
	gorm.Model
	PetID       uint   `json:"pet_id"`
	Name        string `json:"name" gorm:"not null"`
	VaccineDate string `json:"vaccine_date" gorm:"not null"`
	Description string `json:"description"`
}
