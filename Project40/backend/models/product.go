package models

import "gorm.io/gorm"

type Product struct {
	ID          uint    `json:"id" gorm:"primaryKey"`
	Name        string  `json:"name" gorm:"not null"`
	CategoryID  uint    `json:"category_id" gorm:"not null"`
	Category    Category `json:"category,omitempty" gorm:"-"`
	Price       float64 `json:"price" gorm:"not null"`
	Unit        string  `json:"unit" gorm:"default:'斤'"`
	Description string  `json:"description"`
	CreatedAt   int64   `json:"created_at"`
	UpdatedAt   int64   `json:"updated_at"`
}

func (Product) TableName() string {
	return "products"
}

func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
	p.CreatedAt = tx.NowFunc().Unix()
	p.UpdatedAt = tx.NowFunc().Unix()
	return nil
}

func (p *Product) BeforeUpdate(tx *gorm.DB) (err error) {
	p.UpdatedAt = tx.NowFunc().Unix()
	return nil
}
