package config

import (
	"log"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func InitDB() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "dormitory.db"
	} else {
		dir := filepath.Dir(dbPath)
		if dir != "." && dir != "" {
			os.MkdirAll(dir, 0755)
		}
	}

	var err error
	db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	log.Println("Database connected successfully")
}

func GetDB() *gorm.DB {
	return db
}
