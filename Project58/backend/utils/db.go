package utils

import (
	"project58/backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() error {
	dsn := "root:123456@tcp(127.0.0.1:3306)/office_supplies?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	DB = db

	err = db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Supply{},
		&models.Application{},
		&models.ApplicationItem{},
		&models.StockRecord{},
	)
	if err != nil {
		return err
	}

	err = initSeedData(db)
	if err != nil {
		return err
	}

	return nil
}

func initSeedData(db *gorm.DB) error {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		return nil
	}

	adminPwd, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	managerPwd, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	employeePwd, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)

	users := []models.User{
		{Username: "admin", Password: string(adminPwd), Name: "系统管理员", Role: 3},
		{Username: "manager", Password: string(managerPwd), Name: "部门经理", Role: 2},
		{Username: "employee", Password: string(employeePwd), Name: "普通员工", Role: 1},
	}

	for _, user := range users {
		if err := db.Create(&user).Error; err != nil {
			return err
		}
	}

	categories := []models.Category{
		{Name: "办公文具", Description: "笔、本、文件夹等"},
		{Name: "数码设备", Description: "U盘、鼠标、键盘等"},
		{Name: "办公家具", Description: "桌椅、柜子等"},
	}

	for _, category := range categories {
		if err := db.Create(&category).Error; err != nil {
			return err
		}
	}

	supplies := []models.Supply{
		{CategoryID: 1, Name: "黑色签字笔", Spec: "0.5mm", Unit: "支", Stock: 100, MinStock: 20},
		{CategoryID: 1, Name: "A4打印纸", Spec: "500张/包", Unit: "包", Stock: 50, MinStock: 10},
		{CategoryID: 1, Name: "文件夹", Spec: "蓝色", Unit: "个", Stock: 80, MinStock: 15},
		{CategoryID: 2, Name: "U盘", Spec: "64G", Unit: "个", Stock: 30, MinStock: 5},
		{CategoryID: 2, Name: "无线鼠标", Spec: "黑色", Unit: "个", Stock: 25, MinStock: 5},
		{CategoryID: 3, Name: "办公椅", Spec: "人体工学", Unit: "把", Stock: 10, MinStock: 2},
	}

	for _, supply := range supplies {
		if err := db.Create(&supply).Error; err != nil {
			return err
		}
	}

	return nil
}
