package models

import "gorm.io/gorm"

type Owner struct {
	gorm.Model
	Name        string `json:"name" gorm:"not null"`
	Phone       string `json:"phone"`
	Address     string `json:"address"`
	Description string `json:"description"`
}
