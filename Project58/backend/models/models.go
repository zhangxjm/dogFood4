package models

import (
	"time"
)

type User struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Username  string    `gorm:"unique;size:50;not null" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	Name      string    `gorm:"size:50;not null" json:"name"`
	Role      int       `gorm:"not null;default:1" json:"role"` // 1:员工 2:经理 3:管理员
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Category struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Supplies    []Supply  `gorm:"foreignKey:CategoryID" json:"-"`
}

type Supply struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	CategoryID  uint      `gorm:"not null" json:"category_id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Spec        string    `gorm:"size:100" json:"spec"`
	Unit        string    `gorm:"size:20" json:"unit"`
	Stock       int       `gorm:"not null;default:0" json:"stock"`
	MinStock    int       `gorm:"not null;default:10" json:"min_stock"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Category    Category  `gorm:"foreignKey:CategoryID" json:"-"`
}

type Application struct {
	ID        uint             `gorm:"primarykey" json:"id"`
	UserID    uint             `gorm:"not null" json:"user_id"`
	Title     string           `gorm:"size:200;not null" json:"title"`
	Status    int              `gorm:"not null;default:0" json:"status"` // 0:待审批 1:一级通过 2:二级通过 3:已驳回 4:已收货
	Remark    string           `gorm:"type:text" json:"remark"`
	CreatedAt time.Time        `json:"created_at"`
	UpdatedAt time.Time        `json:"updated_at"`
	User      User             `gorm:"foreignKey:UserID" json:"-"`
	Items     []ApplicationItem `gorm:"foreignKey:ApplicationID" json:"items"`
}

type ApplicationItem struct {
	ID            uint        `gorm:"primarykey" json:"id"`
	ApplicationID uint        `gorm:"not null" json:"application_id"`
	SupplyID      uint        `gorm:"not null" json:"supply_id"`
	Quantity      int         `gorm:"not null" json:"quantity"`
	CreatedAt     time.Time   `json:"created_at"`
	Supply        Supply      `gorm:"foreignKey:SupplyID" json:"-"`
}

type StockRecord struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	SupplyID    uint      `gorm:"not null" json:"supply_id"`
	Type        int       `gorm:"not null" json:"type"` // 1:入库 2:出库
	Quantity    int       `gorm:"not null" json:"quantity"`
	StockBefore int       `gorm:"not null" json:"stock_before"`
	StockAfter  int       `gorm:"not null" json:"stock_after"`
	UserID      uint      `gorm:"not null" json:"user_id"`
	Remark      string    `gorm:"type:text" json:"remark"`
	CreatedAt   time.Time `json:"created_at"`
	Supply      Supply    `gorm:"foreignKey:SupplyID" json:"-"`
	User        User      `gorm:"foreignKey:UserID" json:"-"`
}
