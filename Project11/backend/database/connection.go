package database

import (
	"charging-station-backend/config"
	"context"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB
var RedisClient *redis.Client

func InitMySQL() error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.AppConfig.Database.User,
		config.AppConfig.Database.Password,
		config.AppConfig.Database.Host,
		config.AppConfig.Database.Port,
		config.AppConfig.Database.Name,
	)

	var err error
	for i := 0; i < 30; i++ {
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			sqlDB, _ := DB.DB()
			sqlDB.SetMaxIdleConns(10)
			sqlDB.SetMaxOpenConns(100)
			sqlDB.SetConnMaxLifetime(time.Hour)
			log.Println("MySQL connected successfully")
			return nil
		}
		log.Printf("MySQL connection attempt %d failed: %v, retrying...", i+1, err)
		time.Sleep(2 * time.Second)
	}
	return err
}

func InitRedis() error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", config.AppConfig.Redis.Host, config.AppConfig.Redis.Port),
		Password: config.AppConfig.Redis.Password,
		DB:       config.AppConfig.Redis.DB,
	})

	for i := 0; i < 30; i++ {
		ctx := context.Background()
		_, err := RedisClient.Ping(ctx).Result()
		if err == nil {
			log.Println("Redis connected successfully")
			return nil
		}
		log.Printf("Redis connection attempt %d failed: %v, retrying...", i+1, err)
		time.Sleep(2 * time.Second)
	}
	return fmt.Errorf("failed to connect to Redis after retries")
}

func Close() {
	if sqlDB, err := DB.DB(); err == nil {
		sqlDB.Close()
	}
	if RedisClient != nil {
		RedisClient.Close()
	}
}
