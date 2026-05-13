package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoad_DefaultValues(t *testing.T) {
	os.Clearenv()

	cfg := Load()

	assert.Equal(t, "localhost:6379", cfg.RedisAddr)
	assert.Equal(t, "", cfg.RedisPassword)
	assert.Equal(t, 0, cfg.RedisDB)
	assert.Equal(t, "8080", cfg.ServerPort)
}

func TestLoad_WithEnvVariables(t *testing.T) {
	os.Clearenv()
	os.Setenv("REDIS_ADDR", "redis:6380")
	os.Setenv("REDIS_PASSWORD", "secret123")
	os.Setenv("REDIS_DB", "5")
	os.Setenv("SERVER_PORT", "9000")

	cfg := Load()

	assert.Equal(t, "redis:6380", cfg.RedisAddr)
	assert.Equal(t, "secret123", cfg.RedisPassword)
	assert.Equal(t, 5, cfg.RedisDB)
	assert.Equal(t, "9000", cfg.ServerPort)
}

func TestLoad_InvalidRedisDB(t *testing.T) {
	os.Clearenv()
	os.Setenv("REDIS_DB", "invalid")

	cfg := Load()

	assert.Equal(t, 0, cfg.RedisDB)
}

func TestLoad_EmptyEnvValues(t *testing.T) {
	os.Clearenv()
	os.Setenv("REDIS_ADDR", "")
	os.Setenv("REDIS_PASSWORD", "")
	os.Setenv("REDIS_DB", "")
	os.Setenv("SERVER_PORT", "")

	cfg := Load()

	assert.Equal(t, "localhost:6379", cfg.RedisAddr)
	assert.Equal(t, "", cfg.RedisPassword)
	assert.Equal(t, 0, cfg.RedisDB)
	assert.Equal(t, "8080", cfg.ServerPort)
}
