class WebSocketManager {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 3000
    this.listeners = new Map()
    this.isConnected = false
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/ws/user`

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.emit('connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.emit('disconnected')
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', error)
      }
    } catch (e) {
      console.error('Failed to create WebSocket:', e)
      this.attemptReconnect()
    }
  }

  handleMessage(message) {
    const { type, stationId, data, time } = message

    switch (type) {
      case 'heartbeat':
        this.emit('heartbeat', { time })
        break
      case 'power_report':
        this.emit('powerReport', { stationId, data: JSON.parse(data), time })
        break
      case 'alarm':
        this.emit('alarm', { stationId, data: JSON.parse(data), time })
        break
      case 'status_update':
        this.emit('statusUpdate', { stationId, data: JSON.parse(data), time })
        break
      case 'control_ack':
        this.emit('controlAck', { stationId, data: JSON.parse(data), time })
        break
      default:
        console.log('Unknown message type:', type)
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      setTimeout(() => this.connect(), this.reconnectDelay)
    } else {
      console.error('Max reconnect attempts reached')
      this.emit('maxReconnectAttempts')
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (e) {
          console.error('Listener error:', e)
        }
      })
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
    this.listeners.clear()
  }
}

export const wsManager = new WebSocketManager()
export default wsManager
