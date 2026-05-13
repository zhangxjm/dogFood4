package services

import (
	"iot-monitor/models"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewDeviceService(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	assert.NotNil(t, service)
}

func TestCreateDevice(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	device, err := service.CreateDevice("Test Sensor", "group-1", "temperature_sensor")

	require.NoError(t, err)
	assert.NotEmpty(t, device.ID)
	assert.Equal(t, "Test Sensor", device.Name)
	assert.Equal(t, "group-1", device.GroupID)
	assert.Equal(t, "temperature_sensor", device.Type)
	assert.Equal(t, models.DeviceOnline, device.Status)
	assert.Equal(t, 25.0, device.Temperature)
	assert.Equal(t, 50.0, device.Humidity)
	assert.Equal(t, 1013.25, device.Pressure)

	saved, err := mockRepo.GetDevice(device.ID)
	require.NoError(t, err)
	assert.Equal(t, device.ID, saved.ID)
}

func TestCreateGroup(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	group, err := service.CreateGroup("Production Line A")

	require.NoError(t, err)
	assert.NotEmpty(t, group.ID)
	assert.Equal(t, "Production Line A", group.Name)
}

func TestCheckAlerts_NoAlert(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	device := &models.Device{
		ID:          "dev-1",
		Name:        "Normal Device",
		Temperature: 25.0,
		Humidity:    50.0,
		Pressure:    1013.0,
	}

	alert, hasAlert := service.CheckAlerts(device)

	assert.False(t, hasAlert)
	assert.Nil(t, alert)
}

func TestCheckAlerts_HighTemperature(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	device := &models.Device{
		ID:          "dev-1",
		Name:        "Hot Device",
		Temperature: 45.0,
		Humidity:    50.0,
		Pressure:    1013.0,
	}

	alert, hasAlert := service.CheckAlerts(device)

	assert.True(t, hasAlert)
	require.NotNil(t, alert)
	assert.Equal(t, "dev-1", alert.DeviceID)
	assert.Equal(t, "Hot Device", alert.DeviceName)
	assert.Equal(t, "temperature", alert.Type)
	assert.Equal(t, "温度过高告警", alert.Message)
	assert.Equal(t, "critical", alert.Level)
	assert.False(t, alert.Resolved)
}

func TestCheckAlerts_LowTemperature(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	device := &models.Device{
		ID:          "dev-1",
		Name:        "Cold Device",
		Temperature: -5.0,
		Humidity:    50.0,
		Pressure:    1013.0,
	}

	alert, hasAlert := service.CheckAlerts(device)

	assert.True(t, hasAlert)
	require.NotNil(t, alert)
	assert.Equal(t, "温度过低告警", alert.Message)
	assert.Equal(t, "critical", alert.Level)
}

func TestCheckAlerts_HighHumidity(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	device := &models.Device{
		ID:          "dev-1",
		Name:        "Humid Device",
		Temperature: 25.0,
		Humidity:    85.0,
		Pressure:    1013.0,
	}

	alert, hasAlert := service.CheckAlerts(device)

	assert.True(t, hasAlert)
	require.NotNil(t, alert)
	assert.Equal(t, "humidity", alert.Type)
	assert.Equal(t, "湿度过高告警", alert.Message)
	assert.Equal(t, "warning", alert.Level)
}

func TestCheckAlerts_HighPressure(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	device := &models.Device{
		ID:          "dev-1",
		Name:        "High Pressure Device",
		Temperature: 25.0,
		Humidity:    50.0,
		Pressure:    1050.0,
	}

	alert, hasAlert := service.CheckAlerts(device)

	assert.True(t, hasAlert)
	require.NotNil(t, alert)
	assert.Equal(t, "pressure", alert.Type)
	assert.Equal(t, "气压异常告警", alert.Message)
	assert.Equal(t, "warning", alert.Level)
}

func TestCheckAlerts_LowPressure(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	device := &models.Device{
		ID:          "dev-1",
		Name:        "Low Pressure Device",
		Temperature: 25.0,
		Humidity:    50.0,
		Pressure:    980.0,
	}

	alert, hasAlert := service.CheckAlerts(device)

	assert.True(t, hasAlert)
	require.NotNil(t, alert)
	assert.Equal(t, "pressure", alert.Type)
}

func TestGenerateSensorData(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	testCases := []struct {
		name       string
		deviceType string
		tempBase   float64
	}{
		{"default", "generic", 25.0},
		{"temperature sensor", "temperature_sensor", 30.0},
		{"humidity sensor", "humidity_sensor", 22.0},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			device := &models.Device{
				ID:   "dev-1",
				Name: "Test Device",
				Type: tc.deviceType,
			}

			data := service.GenerateSensorData(device)

			assert.NotNil(t, data)
			assert.Equal(t, "dev-1", data.DeviceID)
			assert.InDelta(t, tc.tempBase, data.Temperature, 5.0)
			assert.InDelta(t, 55.0, data.Humidity, 10.0)
			assert.InDelta(t, 1015.0, data.Pressure, 5.0)
			assert.Equal(t, data.Temperature, device.Temperature)
			assert.Equal(t, data.Humidity, device.Humidity)
			assert.Equal(t, data.Pressure, device.Pressure)
		})
	}
}

func TestGetStatistics_Empty(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	stats, err := service.GetStatistics()

	require.NoError(t, err)
	assert.Equal(t, 0, stats.TotalDevices)
	assert.Equal(t, 0, stats.OnlineDevices)
	assert.Equal(t, 0, stats.OfflineDevices)
	assert.Equal(t, 0, stats.WarningDevices)
	assert.Equal(t, 0, stats.TotalAlerts)
}

func TestGetStatistics_WithDevices(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	service.CreateDevice("Online Device", "g1", "temp")
	dev2, _ := service.CreateDevice("Offline Device", "g1", "temp")
	dev3, _ := service.CreateDevice("Warning Device", "g1", "temp")

	mockRepo.devices[dev2.ID].Status = models.DeviceOffline
	mockRepo.devices[dev3.ID].Status = models.DeviceWarning

	service.SaveAlert(&models.Alert{ID: "alert-1"})

	stats, err := service.GetStatistics()

	require.NoError(t, err)
	assert.Equal(t, 3, stats.TotalDevices)
	assert.Equal(t, 1, stats.OnlineDevices)
	assert.Equal(t, 1, stats.OfflineDevices)
	assert.Equal(t, 1, stats.WarningDevices)
	assert.Equal(t, 1, stats.TotalAlerts)
}

func TestGetAllDevices(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	service.CreateDevice("Device 1", "g1", "temp")
	service.CreateDevice("Device 2", "g1", "humidity")

	devices, err := service.GetAllDevices()

	require.NoError(t, err)
	assert.Len(t, devices, 2)
}

func TestDeleteDevice(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	device, _ := service.CreateDevice("To Delete", "g1", "temp")

	err := service.DeleteDevice(device.ID)
	require.NoError(t, err)

	devices, _ := service.GetAllDevices()
	assert.Len(t, devices, 0)
}

func TestGetAllGroups(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	service.CreateGroup("Group 1")
	service.CreateGroup("Group 2")

	groups, err := service.GetAllGroups()

	require.NoError(t, err)
	assert.Len(t, groups, 2)
}

func TestSaveSensorData(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	data := &models.SensorData{
		DeviceID:    "dev-1",
		Temperature: 25.0,
		Humidity:    50.0,
		Pressure:    1013.0,
	}

	err := service.SaveSensorData(data)
	require.NoError(t, err)

	history, err := service.GetSensorHistory("dev-1", 10)
	require.NoError(t, err)
	assert.Len(t, history, 1)
}

func TestUpdateDeviceStatus(t *testing.T) {
	mockRepo := newMockRepository()
	service := NewDeviceService(mockRepo)

	device, _ := service.CreateDevice("Test", "g1", "temp")

	err := service.UpdateDeviceStatus(device.ID, models.DeviceOffline)
	require.NoError(t, err)

	updated, _ := mockRepo.GetDevice(device.ID)
	assert.Equal(t, models.DeviceOffline, updated.Status)
}
