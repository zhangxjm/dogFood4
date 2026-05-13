package models

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	dsn := "attendance:attendance123@tcp(127.0.0.1:3306)/attendance?charset=utf8mb4&parseTime=True&loc=Local"
	
	var err error
	retries := 10
	for retries > 0 {
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err == nil {
			break
		}
		log.Printf("连接数据库失败，重试中... (%d次剩余)\n", retries)
		retries--
		time.Sleep(3 * time.Second)
	}
	
	if err != nil {
		panic(fmt.Sprintf("连接数据库失败: %v", err))
	}
	
	err = DB.AutoMigrate(&Worker{}, &AttendanceRecord{})
	if err != nil {
		panic(fmt.Sprintf("自动迁移失败: %v", err))
	}
	
	log.Println("数据库初始化成功")
}
