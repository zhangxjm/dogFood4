import { useMonitorStore } from '../stores'

class WebSocketManager {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 3000
    this.store = null
  }

  connect() {
    this.store = useMonitorStore()
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/ws`
    
    try {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.store.setConnected(true)
        this.reconnectAttempts = 0
        this.store.fetchAllData()
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (e) {
          console.error('Failed to parse WS message:', e)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.store.setConnected(false)
        this.scheduleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (e) {
      console.error('Failed to create WebSocket:', e)
      this.scheduleReconnect()
    }
  }

  handleMessage(message) {
    switch (message.type) {
      case 'sensor_data':
        this.store.addSensorData(message.payload)
        break
      case 'device_update':
        this.store.updateDevice(message.payload)
        break
      case 'alert':
        this.store.addAlert(message.payload)
        break
      case 'statistics':
        this.store.updateStatistics(message.payload)
        break
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 5)
      console.log(`Reconnecting in ${delay / 1000}s... (attempt ${this.reconnectAttempts})`)
      setTimeout(() => this.connect(), delay)
    } else {
      console.log('Max reconnect attempts reached')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const wsManager = new WebSocketManager()
