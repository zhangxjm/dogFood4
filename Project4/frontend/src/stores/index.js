import { defineStore } from 'pinia'
import { deviceAPI, alertAPI, statsAPI } from '../api'

export const useMonitorStore = defineStore('monitor', {
  state: () => ({
    devices: [],
    alerts: [],
    statistics: {
      total_devices: 0,
      online_devices: 0,
      offline_devices: 0,
      warning_devices: 0,
      total_alerts: 0
    },
    selectedDevice: null,
    sensorHistory: {},
    isConnected: false
  }),

  getters: {
    onlineDevices: (state) => state.devices.filter(d => d.status === 'online'),
    offlineDevices: (state) => state.devices.filter(d => d.status === 'offline'),
    warningDevices: (state) => state.devices.filter(d => d.status === 'warning'),
    devicesByGroup: (state) => {
      const groups = {}
      state.devices.forEach(d => {
        const gid = d.group_id || 'default'
        if (!groups[gid]) groups[gid] = []
        groups[gid].push(d)
      })
      return groups
    }
  },

  actions: {
    async fetchAllData() {
      try {
        const [devicesRes, alertsRes, statsRes] = await Promise.all([
          deviceAPI.getAll(),
          alertAPI.getRecent(),
          statsAPI.get()
        ])
        this.devices = devicesRes.data.data || []
        this.alerts = alertsRes.data.data || []
        this.statistics = statsRes.data.data || this.statistics
        if (this.devices.length > 0 && !this.selectedDevice) {
          this.selectedDevice = this.devices[0]
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    },

    async fetchDeviceHistory(deviceId) {
      try {
        const res = await deviceAPI.getHistory(deviceId)
        this.sensorHistory[deviceId] = res.data.data || []
        return this.sensorHistory[deviceId]
      } catch (error) {
        console.error('Failed to fetch history:', error)
        return []
      }
    },

    selectDevice(device) {
      this.selectedDevice = device
      if (device && !this.sensorHistory[device.id]) {
        this.fetchDeviceHistory(device.id)
      }
    },

    updateDevice(device) {
      const index = this.devices.findIndex(d => d.id === device.id)
      if (index !== -1) {
        this.devices[index] = device
      }
      if (this.selectedDevice && this.selectedDevice.id === device.id) {
        this.selectedDevice = device
      }
    },

    addSensorData(data) {
      if (!this.sensorHistory[data.device_id]) {
        this.sensorHistory[data.device_id] = []
      }
      const history = this.sensorHistory[data.device_id]
      history.push(data)
      if (history.length > 50) {
        history.shift()
      }
    },

    addAlert(alert) {
      this.alerts.unshift(alert)
      if (this.alerts.length > 50) {
        this.alerts.pop()
      }
    },

    updateStatistics(stats) {
      this.statistics = stats
    },

    setConnected(connected) {
      this.isConnected = connected
    }
  }
})
