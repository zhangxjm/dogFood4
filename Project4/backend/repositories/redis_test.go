package repositories

import (
	"context"
	"iot-monitor/config"
	"iot-monitor/models"
	"testing"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var testCtx = context.Background()

func setupTestRedis(t *testing.T) (*RedisRepository, func()) {
	cfg := &config.Config{
		RedisAddr:     "localhost:6379",
		RedisPassword: "",
		RedisDB:       1,
	}

	repo := NewRedisRepository(cfg)

	err := repo.Ping()
	if err != nil {
		t.Skip("Redis not available, skipping integration tests")
	}

	client := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})
	client.FlushDB(testCtx)

	return repo, func() {
		client.FlushDB(testCtx)
		client.Close()
	}
}

func TestRedisRepository_Ping(t *testing.T) {
	repo, cleanup := setupTestRedis(t)
	defer cleanup()

	err := repo.Ping()
	assert.NoError(t, err)
}

func TestRedisRepository_SaveAndGetDevice(t *testing.T) {
	repo, cleanup := setupTestRedis(t)
	defer cleanup()

	device := &models.Device{
		ID:          "test-dev-1",
		Name:        "Test Sensor",
		GroupID:     "group-1",
		Type:        "temperature_sensor",
		Status:      models.DeviceOnline,
		Temperature: 25.5,
		Humidity:    50.0,
		Pressure:    1013.25,
		LastSeen:    time.Now(),
		CreatedAt:   time.Now(),
	}

	err := repo.SaveDevice(device)
	require.NoError(t, err)

	retrieved, err := repo.GetDevice("test-dev-1")
	require.NoError(t, err)
	assert.Equal(t, "test-dev-1", retrieved.ID)
	assert.Equal(t, "Test Sensor", retrieved.Name)
	assert.Equal(t, "temperature_sensor", retrieved.Type)
	assert.Equal(t, models.DeviceOnline, retrieved.Status)
	assert.InDelta(t, 25.5, retrieved.Temperature, 0.01)
}

func TestRedisRepository_GetDevice_NotFound(t *testing.T) {
	repo, cleanup := setupTestRedis(t)
	defer cleanup()

	_, err := repo.GetDevice("nonexistent")
	assert.Error(t, err)
}

func TestRedisRepository_GetAllDevices(t *testing.T) {
	repo, cleanup := setupTestRedis(t)
	defer cleanup()

	devices, err := repo.GetAllDevices()
	require.NoError(t, err)
	assert.Len(t, devices, 0)

	repo.SaveDevice(&models.Device{ID: "dev-1", Name: "Device 1"})
	repo.SaveDevice(&models.Device{ID: "dev-2", Name: "Device 2"})

	devices, err = repo.GetAllDevices()
	require.NoError(t, err)
	assert.Len(t, devices, 2)
}

func TestRedisRepository_DeleteDevice(t *testing.T) {
	repo, cleanup := setupTestRedis(t)
	defer cleanup()

	repo.SaveDevice(&models.Device{ID: "dev-to-delete", Name: "To Delete"})

	devices, _ := repo.GetAllDevices()
	assert.Len(t, devices, 1)

	err := repo.DeleteDevice("dev-to-delete")
	require.NoError(t, err)

	devices, _ = repo.GetAllDevices()
	assert.Len(t, devices, 0)
}

func TestRedisRepository_SaveAndGetGroups(t *testing.T) {
	repo, cleanup := setupTestRedis(t)
	defer cleanup()

	groups, err := repo.GetAllDeviceGroups()
	require.NoError(t, err)
	assert.Len(t, groups, 0)

	group := &models.DeviceGroup{
		ID:        "group-1",
		Name:      "Production Line",
		CreatedAt: time.Now(),
	}

	err = repo.SaveDeviceGroup(group)
	require.NoError(t, err)

	groups, err = repo.GetAllDeviceGroups()
	require.NoError(t, err)
	assert.Len(t, groups, 1)
	assert.Equal(t, "Production Line", groups[0].Name)
}

func TestRedisRepository_SaveAndGetSensorHistory(t *testing.T) {
	repo, cleanup := setupTestRedis(t)
	defer cleanup()

	for i := 0; i < 5; i++ {
		data := &models.SensorData{
			DeviceID:    "dev-1",
			Temperature: 20.0 + float64(i),
			Humidity:    50.0,
			Pressure:    1013.0,
			Timestamp:   time.Now(),
		}
		err := repo.SaveSensorData(data)
		require.NoError(t, err)
	}

	history, err := repo.GetSensorHistory("dev-1", 10)
	require.NoError(t, err)
	assert.Len(t, history, 5)
}

func TestRedisRepository_SaveAndGetAlerts(t *testing.T) {
	repo, cleanup := setupTestRedis(t)
	defer cleanup()

	alert1 := &models.Alert{
		ID:         "alert-1",
		DeviceID:   "dev-1",
		DeviceName: "Sensor 1",
		Type:       "temperature",
		Message:    "High temperature",
		Level:      "critical",
		Timestamp:  time.Now(),
		Resolved:   false,
	}

	alert2 := &models.Alert{
		ID:         "alert-2",
		DeviceID:   "dev-2",
		DeviceName: "Sensor 2",
		Type:       "humidity",
		Message:    "High humidity",
		Level:      "warning",
		Timestamp:  time.Now(),
		Resolved:   false,
	}

	err := repo.SaveAlert(alert1)
	require.NoError(t, err)
	err = repo.SaveAlert(alert2)
	require.NoError(t, err)

	alerts, err := repo.GetRecentAlerts(10)
	require.NoError(t, err)
	assert.Len(t, alerts, 2)
}

func TestRedisRepository_UpdateDeviceStatus(t *testing.T) {
	repo, cleanup := setupTestRedis(t)
	defer cleanup()

	device := &models.Device{
		ID:     "dev-status",
		Name:   "Status Test",
		Status: models.DeviceOnline,
	}

	err := repo.SaveDevice(device)
	require.NoError(t, err)

	err = repo.UpdateDeviceStatus("dev-status", models.DeviceWarning)
	require.NoError(t, err)

	updated, err := repo.GetDevice("dev-status")
	require.NoError(t, err)
	assert.Equal(t, models.DeviceWarning, updated.Status)
}
