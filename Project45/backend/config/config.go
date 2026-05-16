package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Log      LogConfig
}

type ServerConfig struct {
	Port string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	DBName   string
	Charset  string
}

type LogConfig struct {
	Level string
}

var AppConfig *Config

func LoadConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")
	viper.AddConfigPath(".")

	viper.AutomaticEnv()
	viper.SetEnvPrefix("DB")
	viper.BindEnv("host", "DB_HOST")
	viper.BindEnv("port", "DB_PORT")
	viper.BindEnv("username", "DB_USER")
	viper.BindEnv("password", "DB_PASSWORD")
	viper.BindEnv("dbname", "DB_NAME")

	viper.SetDefault("server.port", "8080")
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", "3306")
	viper.SetDefault("database.username", "root")
	viper.SetDefault("database.password", "123456")
	viper.SetDefault("database.dbname", "warehouse")
	viper.SetDefault("database.charset", "utf8mb4")
	viper.SetDefault("log.level", "debug")

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("Warning: config file not found, using default values: %v", err)
	}

	dbHost := viper.GetString("DB_HOST")
	if dbHost == "" {
		dbHost = viper.GetString("database.host")
	}

	dbPort := viper.GetString("DB_PORT")
	if dbPort == "" {
		dbPort = viper.GetString("database.port")
	}

	dbUser := viper.GetString("DB_USER")
	if dbUser == "" {
		dbUser = viper.GetString("database.username")
	}

	dbPassword := viper.GetString("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = viper.GetString("database.password")
	}

	dbName := viper.GetString("DB_NAME")
	if dbName == "" {
		dbName = viper.GetString("database.dbname")
	}

	AppConfig = &Config{
		Server: ServerConfig{
			Port: viper.GetString("server.port"),
		},
		Database: DatabaseConfig{
			Host:     dbHost,
			Port:     dbPort,
			Username: dbUser,
			Password: dbPassword,
			DBName:   dbName,
			Charset:  viper.GetString("database.charset"),
		},
		Log: LogConfig{
			Level: viper.GetString("log.level"),
		},
	}

	log.Printf("Configuration loaded - DB Host: %s, Port: %s, DB: %s", dbHost, dbPort, dbName)
}
