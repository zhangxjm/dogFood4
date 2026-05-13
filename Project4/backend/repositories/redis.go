package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"iot-monitor/config"
	"iot-monitor/models"
	"time"

	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

type RedisRepository struct {
	client *redis.Client
}

func NewRedisRepository(cfg *config.Config) *RedisRepository {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})
	return &RedisRepository{client: client}
}

func (r *RedisRepository) Ping() error {
	return r.client.Ping(ctx).Err()
}

func (r *RedisRepository) SaveDevice(device *models.Device) error {
	data, err := json.Marshal(device)
	if err != nil {
		return err
	}
	return r.client.HSet(ctx, "devices", device.ID, data).Err()
}

func (r *RedisRepository) GetDevice(id string) (*models.Device, error) {
	data, err := r.client.HGet(ctx, "devices", id).Result()
	if err != nil {
		return nil, err
	}
	var device models.Device
	err = json.Unmarshal([]byte(data), &device)
	return &device, err
}

func (r *RedisRepository) GetAllDevices() ([]*models.Device, error) {
	results, err := r.client.HGetAll(ctx, "devices").Result()
	if err != nil {
		return nil, err
	}
	devices := make([]*models.Device, 0, len(results))
	for _, data := range results {
		var device models.Device
		if err := json.Unmarshal([]byte(data), &device); err == nil {
			devices = append(devices, &device)
		}
	}
	return devices, nil
}

func (r *RedisRepository) DeleteDevice(id string) error {
	return r.client.HDel(ctx, "devices", id).Err()
}

func (r *RedisRepository) SaveDeviceGroup(group *models.DeviceGroup) error {
	data, err := json.Marshal(group)
	if err != nil {
		return err
	}
	return r.client.HSet(ctx, "device_groups", group.ID, data).Err()
}

func (r *RedisRepository) GetAllDeviceGroups() ([]*models.DeviceGroup, error) {
	results, err := r.client.HGetAll(ctx, "device_groups").Result()
	if err != nil {
		return nil, err
	}
	groups := make([]*models.DeviceGroup, 0, len(results))
	for _, data := range results {
		var group models.DeviceGroup
		if err := json.Unmarshal([]byte(data), &group); err == nil {
			groups = append(groups, &group)
		}
	}
	return groups, nil
}

func (r *RedisRepository) SaveSensorData(data *models.SensorData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	key := fmt.Sprintf("sensor_data:%s", data.DeviceID)
	if err := r.client.RPush(ctx, key, jsonData).Err(); err != nil {
		return err
	}
	return r.client.LTrim(ctx, key, -100, -1).Err()
}

func (r *RedisRepository) GetSensorHistory(deviceID string, limit int64) ([]*models.SensorData, error) {
	key := fmt.Sprintf("sensor_data:%s", deviceID)
	results, err := r.client.LRange(ctx, key, -limit, -1).Result()
	if err != nil {
		return nil, err
	}
	dataList := make([]*models.SensorData, 0, len(results))
	for _, data := range results {
		var sensorData models.SensorData
		if err := json.Unmarshal([]byte(data), &sensorData); err == nil {
			dataList = append(dataList, &sensorData)
		}
	}
	return dataList, nil
}

func (r *RedisRepository) SaveAlert(alert *models.Alert) error {
	data, err := json.Marshal(alert)
	if err != nil {
		return err
	}
	if err := r.client.LPush(ctx, "alerts", data).Err(); err != nil {
		return err
	}
	return r.client.LTrim(ctx, "alerts", 0, 99).Err()
}

func (r *RedisRepository) GetRecentAlerts(limit int64) ([]*models.Alert, error) {
	results, err := r.client.LRange(ctx, "alerts", 0, limit-1).Result()
	if err != nil {
		return nil, err
	}
	alerts := make([]*models.Alert, 0, len(results))
	for _, data := range results {
		var alert models.Alert
		if err := json.Unmarshal([]byte(data), &alert); err == nil {
			alerts = append(alerts, &alert)
		}
	}
	return alerts, nil
}

func (r *RedisRepository) UpdateDeviceStatus(id string, status models.DeviceStatus) error {
	device, err := r.GetDevice(id)
	if err != nil {
		return err
	}
	device.Status = status
	device.LastSeen = time.Now()
	return r.SaveDevice(device)
}
