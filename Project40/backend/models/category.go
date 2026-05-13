package models

import "gorm.io/gorm"

type Category struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	Name      string `json:"name" gorm:"not null;unique"`
	CreatedAt int64  `json:"created_at"`
	UpdatedAt int64  `json:"updated_at"`
}

func (Category) TableName() string {
	return "categories"
}

func (c *Category) BeforeCreate(tx *gorm.DB) (err error) {
	c.CreatedAt = tx.NowFunc().Unix()
	c.UpdatedAt = tx.NowFunc().Unix()
	return nil
}

func (c *Category) BeforeUpdate(tx *gorm.DB) (err error) {
	c.UpdatedAt = tx.NowFunc().Unix()
	return nil
}
