package repositories

import "iot-monitor/models"

type Repository interface {
	Ping() error
	SaveDevice(device *models.Device) error
	GetDevice(id string) (*models.Device, error)
	GetAllDevices() ([]*models.Device, error)
	DeleteDevice(id string) error
	SaveDeviceGroup(group *models.DeviceGroup) error
	GetAllDeviceGroups() ([]*models.DeviceGroup, error)
	SaveSensorData(data *models.SensorData) error
	GetSensorHistory(deviceID string, limit int64) ([]*models.SensorData, error)
	SaveAlert(alert *models.Alert) error
	GetRecentAlerts(limit int64) ([]*models.Alert, error)
	UpdateDeviceStatus(id string, status models.DeviceStatus) error
}
