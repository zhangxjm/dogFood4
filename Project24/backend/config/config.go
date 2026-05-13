package config

import (
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() error {
	wd, err := os.Getwd()
	if err == nil {
		envPath := wd + "/.env"
		if _, err := os.Stat(envPath); err == nil {
			if err := godotenv.Load(envPath); err != nil {
				return err
			}
			return nil
		}
	}
	return godotenv.Load()
}
