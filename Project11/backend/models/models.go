package models

import (
	"encoding/json"
	"time"
)

type ChargingStation struct {
	ID            string    `gorm:"primaryKey;column:id" json:"id"`
	Name          string    `gorm:"column:name" json:"name"`
	Location      string    `gorm:"column:location" json:"location"`
	Status        string    `gorm:"column:status" json:"status"`
	PowerCapacity float64   `gorm:"column:power_capacity" json:"powerCapacity"`
	CurrentPower  float64   `gorm:"column:current_power" json:"currentPower"`
	Voltage       float64   `gorm:"column:voltage" json:"voltage"`
	Current       float64   `gorm:"column:current" json:"current"`
	Temperature   float64   `gorm:"column:temperature" json:"temperature"`
	LastHeartbeat time.Time `gorm:"column:last_heartbeat" json:"lastHeartbeat"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

func (ChargingStation) TableName() string {
	return "charging_stations"
}

type ChargingOrder struct {
	ID            string    `gorm:"primaryKey;column:id" json:"id"`
	StationID     string    `gorm:"column:station_id" json:"stationId"`
	UserID        string    `gorm:"column:user_id" json:"userId"`
	StartTime     time.Time `gorm:"column:start_time" json:"startTime"`
	EndTime       time.Time `gorm:"column:end_time" json:"endTime"`
	StartEnergy   float64   `gorm:"column:start_energy" json:"startEnergy"`
	EndEnergy     float64   `gorm:"column:end_energy" json:"endEnergy"`
	TotalEnergy   float64   `gorm:"column:total_energy" json:"totalEnergy"`
	PricePerKwh   float64   `gorm:"column:price_per_kwh" json:"pricePerKwh"`
	TotalAmount   float64   `gorm:"column:total_amount" json:"totalAmount"`
	Status        string    `gorm:"column:status" json:"status"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

func (ChargingOrder) TableName() string {
	return "charging_orders"
}

type PowerRecord struct {
	ID          int64     `gorm:"primaryKey;column:id" json:"id"`
	StationID   string    `gorm:"column:station_id" json:"stationId"`
	Power       float64   `gorm:"column:power" json:"power"`
	Voltage     float64   `gorm:"column:voltage" json:"voltage"`
	Current     float64   `gorm:"column:current" json:"current"`
	Temperature float64   `gorm:"column:temperature" json:"temperature"`
	RecordedAt  time.Time `gorm:"column:recorded_at" json:"recordedAt"`
}

func (PowerRecord) TableName() string {
	return "power_records"
}

type Alarm struct {
	ID          int64     `gorm:"primaryKey;column:id" json:"id"`
	StationID   string    `gorm:"column:station_id" json:"stationId"`
	AlarmType   string    `gorm:"column:alarm_type" json:"alarmType"`
	AlarmLevel  string    `gorm:"column:alarm_level" json:"alarmLevel"`
	Message     string    `gorm:"column:message" json:"message"`
	Acknowledged bool     `gorm:"column:acknowledged" json:"acknowledged"`
	Resolved    bool      `gorm:"column:resolved" json:"resolved"`
	ResolvedAt  time.Time `gorm:"column:resolved_at" json:"resolvedAt"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"createdAt"`
}

func (Alarm) TableName() string {
	return "alarms"
}

type ControlCommand struct {
	ID            int64           `gorm:"primaryKey;column:id" json:"id"`
	StationID     string          `gorm:"column:station_id" json:"stationId"`
	CommandType   string          `gorm:"column:command_type" json:"commandType"`
	CommandData   json.RawMessage `gorm:"column:command_data;type:json" json:"commandData"`
	Status        string          `gorm:"column:status" json:"status"`
	ResultMessage string          `gorm:"column:result_message" json:"resultMessage"`
	CreatedAt     time.Time       `gorm:"column:created_at" json:"createdAt"`
	ExecutedAt    time.Time       `gorm:"column:executed_at" json:"executedAt"`
}

func (ControlCommand) TableName() string {
	return "control_commands"
}
