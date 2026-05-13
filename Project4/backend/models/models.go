package models

import "time"

type DeviceStatus string

const (
	DeviceOnline  DeviceStatus = "online"
	DeviceOffline DeviceStatus = "offline"
	DeviceWarning DeviceStatus = "warning"
)

type Device struct {
	ID          string       `json:"id"`
	Name        string       `json:"name"`
	GroupID     string       `json:"group_id"`
	Type        string       `json:"type"`
	Status      DeviceStatus `json:"status"`
	LastSeen    time.Time    `json:"last_seen"`
	CreatedAt   time.Time    `json:"created_at"`
	Temperature float64      `json:"temperature"`
	Humidity    float64      `json:"humidity"`
	Pressure    float64      `json:"pressure"`
}

type DeviceGroup struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type SensorData struct {
	DeviceID    string    `json:"device_id"`
	Temperature float64   `json:"temperature"`
	Humidity    float64   `json:"humidity"`
	Pressure    float64   `json:"pressure"`
	Timestamp   time.Time `json:"timestamp"`
}

type Alert struct {
	ID        string    `json:"id"`
	DeviceID  string    `json:"device_id"`
	DeviceName string   `json:"device_name"`
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	Level     string    `json:"level"`
	Timestamp time.Time `json:"timestamp"`
	Resolved  bool      `json:"resolved"`
}

type WSMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type Statistics struct {
	TotalDevices   int `json:"total_devices"`
	OnlineDevices  int `json:"online_devices"`
	OfflineDevices int `json:"offline_devices"`
	WarningDevices int `json:"warning_devices"`
	TotalAlerts    int `json:"total_alerts"`
}
