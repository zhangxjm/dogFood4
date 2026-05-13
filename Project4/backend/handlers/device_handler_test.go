package handlers

import (
	"bytes"
	"encoding/json"
	"iot-monitor/models"
	"iot-monitor/repositories"
	"iot-monitor/services"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockRepoForHandler struct {
	devices map[string]*models.Device
	groups  map[string]*models.DeviceGroup
	alerts  []*models.Alert
	history map[string][]*models.SensorData
}

func newMockRepoForHandler() *mockRepoForHandler {
	return &mockRepoForHandler{
		devices: make(map[string]*models.Device),
		groups:  make(map[string]*models.DeviceGroup),
		alerts:  make([]*models.Alert, 0),
		history: make(map[string][]*models.SensorData),
	}
}

func (m *mockRepoForHandler) Ping() error { return nil }

func (m *mockRepoForHandler) SaveDevice(device *models.Device) error {
	m.devices[device.ID] = device
	return nil
}

func (m *mockRepoForHandler) GetDevice(id string) (*models.Device, error) {
	if d, ok := m.devices[id]; ok {
		return d, nil
	}
	return nil, repositories.ErrNotFound
}

func (m *mockRepoForHandler) GetAllDevices() ([]*models.Device, error) {
	devices := make([]*models.Device, 0, len(m.devices))
	for _, d := range m.devices {
		devices = append(devices, d)
	}
	return devices, nil
}

func (m *mockRepoForHandler) DeleteDevice(id string) error {
	delete(m.devices, id)
	return nil
}

func (m *mockRepoForHandler) SaveDeviceGroup(group *models.DeviceGroup) error {
	m.groups[group.ID] = group
	return nil
}

func (m *mockRepoForHandler) GetAllDeviceGroups() ([]*models.DeviceGroup, error) {
	groups := make([]*models.DeviceGroup, 0, len(m.groups))
	for _, g := range m.groups {
		groups = append(groups, g)
	}
	return groups, nil
}

func (m *mockRepoForHandler) SaveSensorData(data *models.SensorData) error {
	if m.history[data.DeviceID] == nil {
		m.history[data.DeviceID] = make([]*models.SensorData, 0)
	}
	m.history[data.DeviceID] = append(m.history[data.DeviceID], data)
	return nil
}

func (m *mockRepoForHandler) GetSensorHistory(deviceID string, limit int64) ([]*models.SensorData, error) {
	history := m.history[deviceID]
	if history == nil {
		return []*models.SensorData{}, nil
	}
	return history, nil
}

func (m *mockRepoForHandler) SaveAlert(alert *models.Alert) error {
	m.alerts = append([]*models.Alert{alert}, m.alerts...)
	return nil
}

func (m *mockRepoForHandler) GetRecentAlerts(limit int64) ([]*models.Alert, error) {
	return m.alerts, nil
}

func (m *mockRepoForHandler) UpdateDeviceStatus(id string, status models.DeviceStatus) error {
	if d, ok := m.devices[id]; ok {
		d.Status = status
		return nil
	}
	return repositories.ErrNotFound
}

func setupTestRouter() (*gin.Engine, *mockRepoForHandler, *services.DeviceService) {
	gin.SetMode(gin.TestMode)
	mockRepo := newMockRepoForHandler()
	deviceService := services.NewDeviceService(mockRepo)
	handler := NewDeviceHandler(deviceService)

	r := gin.New()
	api := r.Group("/api")
	{
		devices := api.Group("/devices")
		{
			devices.GET("", handler.GetAllDevices)
			devices.POST("", handler.CreateDevice)
			devices.GET("/:id", handler.GetDevice)
			devices.DELETE("/:id", handler.DeleteDevice)
			devices.GET("/:id/history", handler.GetSensorHistory)
		}
		groups := api.Group("/groups")
		{
			groups.GET("", handler.GetAllGroups)
			groups.POST("", handler.CreateGroup)
		}
		api.GET("/alerts", handler.GetRecentAlerts)
		api.GET("/statistics", handler.GetStatistics)
	}

	return r, mockRepo, deviceService
}

func TestGetAllDevices_Empty(t *testing.T) {
	r, _, _ := setupTestRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/devices", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data, ok := response["data"].([]interface{})
	assert.True(t, ok)
	assert.Len(t, data, 0)
}

func TestGetAllDevices_WithData(t *testing.T) {
	r, mockRepo, _ := setupTestRouter()

	mockRepo.devices["dev-1"] = &models.Device{ID: "dev-1", Name: "Sensor 1"}
	mockRepo.devices["dev-2"] = &models.Device{ID: "dev-2", Name: "Sensor 2"}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/devices", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data, ok := response["data"].([]interface{})
	assert.True(t, ok)
	assert.Len(t, data, 2)
}

func TestGetDevice_Found(t *testing.T) {
	r, mockRepo, _ := setupTestRouter()

	mockRepo.devices["dev-1"] = &models.Device{ID: "dev-1", Name: "Test Sensor"}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/devices/dev-1", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data, ok := response["data"].(map[string]interface{})
	assert.True(t, ok)
	assert.Equal(t, "dev-1", data["id"])
	assert.Equal(t, "Test Sensor", data["name"])
}

func TestGetDevice_NotFound(t *testing.T) {
	r, _, _ := setupTestRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/devices/nonexistent", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Equal(t, "Device not found", response["error"])
}

func TestCreateDevice_Success(t *testing.T) {
	r, _, _ := setupTestRouter()

	body := map[string]string{
		"name":        "New Sensor",
		"group_id":    "group-1",
		"device_type": "temperature_sensor",
	}
	jsonBody, _ := json.Marshal(body)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/devices", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data, ok := response["data"].(map[string]interface{})
	assert.True(t, ok)
	assert.Equal(t, "New Sensor", data["name"])
	assert.Equal(t, "group-1", data["group_id"])
	assert.Equal(t, "temperature_sensor", data["type"])
}

func TestCreateDevice_ValidationError(t *testing.T) {
	r, _, _ := setupTestRouter()

	body := map[string]string{}
	jsonBody, _ := json.Marshal(body)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/devices", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestDeleteDevice_Success(t *testing.T) {
	r, mockRepo, _ := setupTestRouter()

	mockRepo.devices["dev-1"] = &models.Device{ID: "dev-1", Name: "To Delete"}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("DELETE", "/api/devices/dev-1", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Equal(t, "Device deleted successfully", response["message"])
	assert.Len(t, mockRepo.devices, 0)
}

func TestGetSensorHistory(t *testing.T) {
	r, mockRepo, _ := setupTestRouter()

	mockRepo.history["dev-1"] = []*models.SensorData{
		{DeviceID: "dev-1", Temperature: 25.0},
		{DeviceID: "dev-1", Temperature: 26.0},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/devices/dev-1/history", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data, ok := response["data"].([]interface{})
	assert.True(t, ok)
	assert.Len(t, data, 2)
}

func TestGetAllGroups_Empty(t *testing.T) {
	r, _, _ := setupTestRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/groups", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data, ok := response["data"].([]interface{})
	assert.True(t, ok)
	assert.Len(t, data, 0)
}

func TestCreateGroup_Success(t *testing.T) {
	r, _, _ := setupTestRouter()

	body := map[string]string{"name": "Production Line"}
	jsonBody, _ := json.Marshal(body)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/groups", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data, ok := response["data"].(map[string]interface{})
	assert.True(t, ok)
	assert.Equal(t, "Production Line", data["name"])
}

func TestCreateGroup_ValidationError(t *testing.T) {
	r, _, _ := setupTestRouter()

	body := map[string]string{}
	jsonBody, _ := json.Marshal(body)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/groups", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetRecentAlerts(t *testing.T) {
	r, mockRepo, _ := setupTestRouter()

	mockRepo.alerts = []*models.Alert{
		{ID: "alert-1", Message: "Test Alert 1"},
		{ID: "alert-2", Message: "Test Alert 2"},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/alerts", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data, ok := response["data"].([]interface{})
	assert.True(t, ok)
	assert.Len(t, data, 2)
}

func TestGetStatistics(t *testing.T) {
	r, mockRepo, _ := setupTestRouter()

	mockRepo.devices["dev-1"] = &models.Device{ID: "dev-1", Status: models.DeviceOnline}
	mockRepo.devices["dev-2"] = &models.Device{ID: "dev-2", Status: models.DeviceOnline}
	mockRepo.alerts = []*models.Alert{{ID: "alert-1"}}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/statistics", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)

	data, ok := response["data"].(map[string]interface{})
	assert.True(t, ok)
	assert.Equal(t, float64(2), data["total_devices"])
	assert.Equal(t, float64(2), data["online_devices"])
	assert.Equal(t, float64(1), data["total_alerts"])
}
