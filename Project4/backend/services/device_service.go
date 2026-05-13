package services

import (
	"iot-monitor/models"
	"iot-monitor/repositories"
	"math/rand"
	"time"

	"github.com/google/uuid"
)

type DeviceService struct {
	repo repositories.Repository
}

func NewDeviceService(repo repositories.Repository) *DeviceService {
	return &DeviceService{repo: repo}
}

func (s *DeviceService) CreateDevice(name, groupID, deviceType string) (*models.Device, error) {
	device := &models.Device{
		ID:          uuid.New().String(),
		Name:        name,
		GroupID:     groupID,
		Type:        deviceType,
		Status:      models.DeviceOnline,
		LastSeen:    time.Now(),
		CreatedAt:   time.Now(),
		Temperature: 25.0,
		Humidity:    50.0,
		Pressure:    1013.25,
	}
	err := s.repo.SaveDevice(device)
	return device, err
}

func (s *DeviceService) GetAllDevices() ([]*models.Device, error) {
	return s.repo.GetAllDevices()
}

func (s *DeviceService) GetDevice(id string) (*models.Device, error) {
	return s.repo.GetDevice(id)
}

func (s *DeviceService) DeleteDevice(id string) error {
	return s.repo.DeleteDevice(id)
}

func (s *DeviceService) CreateGroup(name string) (*models.DeviceGroup, error) {
	group := &models.DeviceGroup{
		ID:        uuid.New().String(),
		Name:      name,
		CreatedAt: time.Now(),
	}
	err := s.repo.SaveDeviceGroup(group)
	return group, err
}

func (s *DeviceService) GetAllGroups() ([]*models.DeviceGroup, error) {
	return s.repo.GetAllDeviceGroups()
}

func (s *DeviceService) GetSensorHistory(deviceID string, limit int64) ([]*models.SensorData, error) {
	return s.repo.GetSensorHistory(deviceID, limit)
}

func (s *DeviceService) GetRecentAlerts(limit int64) ([]*models.Alert, error) {
	return s.repo.GetRecentAlerts(limit)
}

func (s *DeviceService) GetStatistics() (*models.Statistics, error) {
	devices, err := s.repo.GetAllDevices()
	if err != nil {
		return nil, err
	}

	stats := &models.Statistics{
		TotalDevices: len(devices),
	}

	for _, d := range devices {
		switch d.Status {
		case models.DeviceOnline:
			stats.OnlineDevices++
		case models.DeviceOffline:
			stats.OfflineDevices++
		case models.DeviceWarning:
			stats.WarningDevices++
		}
	}

	alerts, err := s.repo.GetRecentAlerts(100)
	if err != nil {
		return nil, err
	}
	stats.TotalAlerts = len(alerts)

	return stats, nil
}

func (s *DeviceService) GenerateSensorData(device *models.Device) *models.SensorData {
	tempBase := 25.0
	if device.Type == "temperature_sensor" {
		tempBase = 30.0
	} else if device.Type == "humidity_sensor" {
		tempBase = 22.0
	}

	data := &models.SensorData{
		DeviceID:    device.ID,
		Temperature: tempBase + rand.Float64()*10 - 5,
		Humidity:    45.0 + rand.Float64()*20,
		Pressure:    1010.0 + rand.Float64()*10,
		Timestamp:   time.Now(),
	}

	device.Temperature = data.Temperature
	device.Humidity = data.Humidity
	device.Pressure = data.Pressure
	device.LastSeen = time.Now()

	return data
}

func (s *DeviceService) CheckAlerts(device *models.Device) (*models.Alert, bool) {
	var alertType, message, level string
	hasAlert := false

	if device.Temperature > 40 || device.Temperature < 0 {
		alertType = "temperature"
		level = "critical"
		if device.Temperature > 40 {
			message = "温度过高告警"
		} else {
			message = "温度过低告警"
		}
		hasAlert = true
	} else if device.Humidity > 80 {
		alertType = "humidity"
		level = "warning"
		message = "湿度过高告警"
		hasAlert = true
	} else if device.Pressure > 1030 || device.Pressure < 990 {
		alertType = "pressure"
		level = "warning"
		message = "气压异常告警"
		hasAlert = true
	}

	if hasAlert {
		alert := &models.Alert{
			ID:         uuid.New().String(),
			DeviceID:   device.ID,
			DeviceName: device.Name,
			Type:       alertType,
			Message:    message,
			Level:      level,
			Timestamp:  time.Now(),
			Resolved:   false,
		}
		return alert, true
	}

	return nil, false
}

func (s *DeviceService) SaveSensorData(data *models.SensorData) error {
	return s.repo.SaveSensorData(data)
}

func (s *DeviceService) SaveDevice(device *models.Device) error {
	return s.repo.SaveDevice(device)
}

func (s *DeviceService) SaveAlert(alert *models.Alert) error {
	return s.repo.SaveAlert(alert)
}

func (s *DeviceService) UpdateDeviceStatus(id string, status models.DeviceStatus) error {
	return s.repo.UpdateDeviceStatus(id, status)
}
