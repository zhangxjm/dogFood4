package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DBConfig
	Redis    RedisConfig
	WS       WSConfig
}

type ServerConfig struct {
	Port string
	Host string
}

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type WSConfig struct {
	Heartbeat int
	Timeout   int
}

var AppConfig Config

func LoadConfig() error {
	if err := godotenv.Load(); err != nil {
	}

	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))
	heartbeat, _ := strconv.Atoi(getEnv("WEBSOCKET_HEARTBEAT", "30"))
	timeout, _ := strconv.Atoi(getEnv("DEVICE_TIMEOUT", "60"))

	AppConfig = Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
		},
		Database: DBConfig{
			Host:     getEnv("DB_HOST", "127.0.0.1"),
			Port:     getEnv("DB_PORT", "3306"),
			User:     getEnv("DB_USER", "charging"),
			Password: getEnv("DB_PASSWORD", "charging123"),
			Name:     getEnv("DB_NAME", "charging_station"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "127.0.0.1"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", "redis123456"),
			DB:       redisDB,
		},
		WS: WSConfig{
			Heartbeat: heartbeat,
			Timeout:   timeout,
		},
	}

	return nil
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}
