package config

import (
	"fmt"
	"os"
	"pet-foster-backend/models"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

var DB *gorm.DB

func ConnectDatabase() {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "3306"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "pet_user"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "pet123456"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "pet_foster"
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	database, err := gorm.Open("mysql", dsn)
	if err != nil {
		panic("Failed to connect to database!")
	}

	database.AutoMigrate(&models.Package{}, &models.Pet{}, &models.Reservation{}, &models.Review{})

	DB = database
}
