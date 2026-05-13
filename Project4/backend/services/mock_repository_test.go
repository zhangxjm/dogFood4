package services

import (
	"iot-monitor/models"
	"iot-monitor/repositories"
)

type mockRepository struct {
	devices map[string]*models.Device
	groups  map[string]*models.DeviceGroup
	alerts  []*models.Alert
	history map[string][]*models.SensorData
}

func newMockRepository() *mockRepository {
	return &mockRepository{
		devices: make(map[string]*models.Device),
		groups:  make(map[string]*models.DeviceGroup),
		alerts:  make([]*models.Alert, 0),
		history: make(map[string][]*models.SensorData),
	}
}

func (m *mockRepository) Ping() error {
	return nil
}

func (m *mockRepository) SaveDevice(device *models.Device) error {
	m.devices[device.ID] = device
	return nil
}

func (m *mockRepository) GetDevice(id string) (*models.Device, error) {
	if d, ok := m.devices[id]; ok {
		return d, nil
	}
	return nil, repositories.ErrNotFound
}

func (m *mockRepository) GetAllDevices() ([]*models.Device, error) {
	devices := make([]*models.Device, 0, len(m.devices))
	for _, d := range m.devices {
		devices = append(devices, d)
	}
	return devices, nil
}

func (m *mockRepository) DeleteDevice(id string) error {
	delete(m.devices, id)
	return nil
}

func (m *mockRepository) SaveDeviceGroup(group *models.DeviceGroup) error {
	m.groups[group.ID] = group
	return nil
}

func (m *mockRepository) GetAllDeviceGroups() ([]*models.DeviceGroup, error) {
	groups := make([]*models.DeviceGroup, 0, len(m.groups))
	for _, g := range m.groups {
		groups = append(groups, g)
	}
	return groups, nil
}

func (m *mockRepository) SaveSensorData(data *models.SensorData) error {
	if m.history[data.DeviceID] == nil {
		m.history[data.DeviceID] = make([]*models.SensorData, 0)
	}
	m.history[data.DeviceID] = append(m.history[data.DeviceID], data)
	if len(m.history[data.DeviceID]) > 100 {
		m.history[data.DeviceID] = m.history[data.DeviceID][len(m.history[data.DeviceID])-100:]
	}
	return nil
}

func (m *mockRepository) GetSensorHistory(deviceID string, limit int64) ([]*models.SensorData, error) {
	history := m.history[deviceID]
	if history == nil {
		return []*models.SensorData{}, nil
	}
	start := int64(0)
	if int64(len(history)) > limit {
		start = int64(len(history)) - limit
	}
	return history[start:], nil
}

func (m *mockRepository) SaveAlert(alert *models.Alert) error {
	m.alerts = append([]*models.Alert{alert}, m.alerts...)
	if len(m.alerts) > 100 {
		m.alerts = m.alerts[:100]
	}
	return nil
}

func (m *mockRepository) GetRecentAlerts(limit int64) ([]*models.Alert, error) {
	if int64(len(m.alerts)) < limit {
		return m.alerts, nil
	}
	return m.alerts[:limit], nil
}

func (m *mockRepository) UpdateDeviceStatus(id string, status models.DeviceStatus) error {
	if d, ok := m.devices[id]; ok {
		d.Status = status
		return nil
	}
	return repositories.ErrNotFound
}
