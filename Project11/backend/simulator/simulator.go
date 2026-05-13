package simulator

import (
	"charging-station-backend/database"
	"charging-station-backend/models"
	"charging-station-backend/websocket"
	"encoding/json"
	"log"
	"math/rand"
	"sync"
	"time"
)

type SimulatedStation struct {
	ID          string
	IsCharging  bool
	BasePower   float64
	CurrentPower float64
	Voltage     float64
	Current     float64
	Temperature float64
	ErrorCount  int
	mu          sync.Mutex
}

var (
	simulators = make(map[string]*SimulatedStation)
	simMu      sync.RWMutex
	running    = false
)

func Start() {
	if running {
		return
	}
	running = true

	var stations []models.ChargingStation
	if err := database.DB.Find(&stations).Error; err != nil {
		log.Printf("Failed to load stations: %v", err)
		return
	}

	simMu.Lock()
	for _, station := range stations {
		simulators[station.ID] = &SimulatedStation{
			ID:          station.ID,
			IsCharging:  false,
			BasePower:   station.PowerCapacity,
			CurrentPower: 0,
			Voltage:     380,
			Current:     0,
			Temperature: 25,
			ErrorCount:  0,
		}
	}
	simMu.Unlock()

	go runSimulation()
	log.Println("Device simulator started")
}

func runSimulation() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		simMu.RLock()
		stations := make([]*SimulatedStation, 0, len(simulators))
		for _, sim := range simulators {
			stations = append(stations, sim)
		}
		simMu.RUnlock()

		for _, sim := range stations {
			sim.mu.Lock()
			simulateStation(sim)
			sim.mu.Unlock()
		}
	}
}

func simulateStation(sim *SimulatedStation) {
	if rand.Float64() < 0.1 {
		sim.IsCharging = !sim.IsCharging
	}

	if sim.IsCharging {
		basePower := sim.BasePower
		variation := (rand.Float64() - 0.5) * 20
		sim.CurrentPower = basePower + variation
		if sim.CurrentPower < 0 {
			sim.CurrentPower = 0
		}
		if sim.CurrentPower > basePower {
			sim.CurrentPower = basePower
		}

		sim.Voltage = 380 + (rand.Float64()-0.5)*20
		sim.Current = sim.CurrentPower / (sim.Voltage / 1000)
		sim.Temperature = 30 + rand.Float64()*20
	} else {
		sim.CurrentPower = 0
		sim.Voltage = 380
		sim.Current = 0
		sim.Temperature = 25 + rand.Float64()*5
	}

	sendPowerReport(sim)

	if rand.Float64() < 0.02 {
		triggerRandomAlarm(sim)
	}
}

func sendPowerReport(sim *SimulatedStation) {
	data := map[string]interface{}{
		"power":       round(sim.CurrentPower, 2),
		"voltage":     round(sim.Voltage, 2),
		"current":     round(sim.Current, 2),
		"temperature": round(sim.Temperature, 2),
		"isCharging":  sim.IsCharging,
	}

	dataBytes, _ := json.Marshal(data)

	msg := &websocket.WSMessage{
		Type:      websocket.MsgTypePowerReport,
		StationID: sim.ID,
		Data:      dataBytes,
		Time:      time.Now().Unix(),
	}

	websocket.GlobalHub.Broadcast(msg)

	now := time.Now()
	database.DB.Model(&models.ChargingStation{}).
		Where("id = ?", sim.ID).
		Updates(map[string]interface{}{
			"current_power":  sim.CurrentPower,
			"voltage":        sim.Voltage,
			"current":        sim.Current,
			"temperature":    sim.Temperature,
			"status":         getStatus(sim),
			"last_heartbeat": now,
		})

	record := &models.PowerRecord{
		StationID:   sim.ID,
		Power:       sim.CurrentPower,
		Voltage:     sim.Voltage,
		Current:     sim.Current,
		Temperature: sim.Temperature,
		RecordedAt:  now,
	}
	database.DB.Create(record)
}

func triggerRandomAlarm(sim *SimulatedStation) {
	alarmTypes := []struct {
		Type    string
		Level   string
		Message string
	}{
		{"over_temperature", "warning", "设备温度过高"},
		{"over_voltage", "warning", "电压异常"},
		{"over_current", "warning", "电流异常"},
		{"power_fluctuation", "info", "功率波动"},
		{"connection_error", "critical", "通信异常"},
	}

	alarm := alarmTypes[rand.Intn(len(alarmTypes))]

	alarmRecord := &models.Alarm{
		StationID:    sim.ID,
		AlarmType:    alarm.Type,
		AlarmLevel:   alarm.Level,
		Message:      alarm.Message,
		Acknowledged: false,
		Resolved:     false,
		CreatedAt:    time.Now(),
	}
	database.DB.Create(alarmRecord)

	data := map[string]interface{}{
		"alarmType": alarm.Type,
		"alarmLevel": alarm.Level,
		"message":   alarm.Message,
		"alarmId":   alarmRecord.ID,
	}

	dataBytes, _ := json.Marshal(data)

	msg := &websocket.WSMessage{
		Type:      websocket.MsgTypeAlarm,
		StationID: sim.ID,
		Data:      dataBytes,
		Time:      time.Now().Unix(),
	}

	websocket.GlobalHub.Broadcast(msg)

	log.Printf("Alarm triggered for %s: %s", sim.ID, alarm.Message)
}

func getStatus(sim *SimulatedStation) string {
	if sim.IsCharging {
		return "charging"
	}
	return "idle"
}

func round(f float64, n int) float64 {
	return float64(int(f*100)) / 100
}

func StartCharging(stationID string) bool {
	simMu.RLock()
	sim, ok := simulators[stationID]
	simMu.RUnlock()

	if !ok {
		return false
	}

	sim.mu.Lock()
	defer sim.mu.Unlock()

	sim.IsCharging = true
	return true
}

func StopCharging(stationID string) bool {
	simMu.RLock()
	sim, ok := simulators[stationID]
	simMu.RUnlock()

	if !ok {
		return false
	}

	sim.mu.Lock()
	defer sim.mu.Unlock()

	sim.IsCharging = false
	sim.CurrentPower = 0
	return true
}

func ResetStation(stationID string) bool {
	simMu.RLock()
	sim, ok := simulators[stationID]
	simMu.RUnlock()

	if !ok {
		return false
	}

	sim.mu.Lock()
	defer sim.mu.Unlock()

	sim.IsCharging = false
	sim.CurrentPower = 0
	sim.Voltage = 380
	sim.Current = 0
	sim.Temperature = 25
	sim.ErrorCount = 0
	return true
}

func GetSimulatedStation(stationID string) *SimulatedStation {
	simMu.RLock()
	defer simMu.RUnlock()
	return simulators[stationID]
}
