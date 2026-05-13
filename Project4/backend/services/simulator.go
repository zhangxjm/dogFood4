package services

import (
	"iot-monitor/models"
	"iot-monitor/websocket"
	"log"
	"math/rand"
	"time"
)

type Simulator struct {
	deviceService *DeviceService
	hub           *websocket.Hub
	initialized   bool
}

func NewSimulator(deviceService *DeviceService, hub *websocket.Hub) *Simulator {
	return &Simulator{
		deviceService: deviceService,
		hub:           hub,
	}
}

func (s *Simulator) InitializeDemoData() error {
	if s.initialized {
		return nil
	}

	groups, err := s.deviceService.GetAllGroups()
	if err != nil || len(groups) == 0 {
		groupNames := []string{"生产车间A", "生产车间B", "仓库区", "办公楼"}
		for _, name := range groupNames {
			if _, err := s.deviceService.CreateGroup(name); err != nil {
				log.Printf("Failed to create group %s: %v", name, err)
			}
		}
	}

	groups, err = s.deviceService.GetAllGroups()
	if err != nil {
		return err
	}

	devices, err := s.deviceService.GetAllDevices()
	if err != nil || len(devices) == 0 {
		deviceTypes := []string{"temperature_sensor", "humidity_sensor", "pressure_sensor", "multi_sensor"}
		deviceNames := []string{
			"温度传感器-001", "湿度传感器-001", "气压传感器-001", "综合传感器-001",
			"温度传感器-002", "湿度传感器-002", "气压传感器-002", "综合传感器-002",
			"温度传感器-003", "湿度传感器-003", "气压传感器-003", "综合传感器-003",
		}

		for i, name := range deviceNames {
			groupID := ""
			if len(groups) > 0 {
				groupID = groups[i%len(groups)].ID
			}
			deviceType := deviceTypes[i%len(deviceTypes)]
			if _, err := s.deviceService.CreateDevice(name, groupID, deviceType); err != nil {
				log.Printf("Failed to create device %s: %v", name, err)
			}
		}
	}

	s.initialized = true
	return nil
}

func (s *Simulator) Start(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	log.Println("Device simulator started")

	for range ticker.C {
		s.simulateOnce()
	}
}

func (s *Simulator) simulateOnce() {
	devices, err := s.deviceService.GetAllDevices()
	if err != nil {
		log.Printf("Failed to get devices: %v", err)
		return
	}

	for _, device := range devices {
		if rand.Float64() < 0.02 {
			continue
		}

		sensorData := s.deviceService.GenerateSensorData(device)

		if rand.Float64() < 0.05 {
			sensorData.Temperature = 45.0 + rand.Float64()*5
			device.Temperature = sensorData.Temperature
		}

		if err := s.deviceService.SaveSensorData(sensorData); err != nil {
			log.Printf("Failed to save sensor data: %v", err)
		}

		if alert, hasAlert := s.deviceService.CheckAlerts(device); hasAlert {
			if err := s.deviceService.SaveAlert(alert); err != nil {
				log.Printf("Failed to save alert: %v", err)
			}
			device.Status = models.DeviceWarning
			s.hub.Broadcast(models.WSMessage{
				Type:    "alert",
				Payload: alert,
			})
		} else {
			device.Status = models.DeviceOnline
		}

		if err := s.deviceService.SaveDevice(device); err != nil {
			log.Printf("Failed to save device: %v", err)
		}

		s.hub.Broadcast(models.WSMessage{
			Type:    "sensor_data",
			Payload: sensorData,
		})

		s.hub.Broadcast(models.WSMessage{
			Type:    "device_update",
			Payload: device,
		})
	}

	if stats, err := s.deviceService.GetStatistics(); err == nil {
		s.hub.Broadcast(models.WSMessage{
			Type:    "statistics",
			Payload: stats,
		})
	}
}
