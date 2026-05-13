package config

type Config struct {
	Port       string
	DBPath     string
	AllowOrigins string
}

func LoadConfig() *Config {
	return &Config{
		Port:         ":8080",
		DBPath:       "./fruit_store.db",
		AllowOrigins: "*",
	}
}
