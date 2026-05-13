import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const getStations = () => api.get('/stations')
export const getStation = (id) => api.get(`/stations/${id}`)
export const getStationStats = () => api.get('/stations/stats')
export const getPowerHistory = (stationId, hours = 1) => 
  api.get('/power/history', { params: { stationId, hours } })
export const sendControl = (id, commandType, data = {}) =>
  api.post(`/stations/${id}/control`, { commandType, data })
export const startCharging = (id) => api.post(`/stations/${id}/start`)
export const stopCharging = (id) => api.post(`/stations/${id}/stop`)
export const resetStation = (id) => api.post(`/stations/${id}/reset`)

export const createOrder = (stationId, userId = '') =>
  api.post('/orders', { stationId, userId })
export const getOrders = (status = '', stationId = '') =>
  api.get('/orders', { params: { status, stationId } })
export const getOrder = (id) => api.get(`/orders/${id}`)
export const endOrder = (id) => api.post(`/orders/${id}/end`)
export const getRevenueStats = () => api.get('/revenue/stats')

export const getAlarms = (resolved = '', stationId = '', level = '') =>
  api.get('/alarms', { params: { resolved, stationId, level } })
export const acknowledgeAlarm = (id) => api.post(`/alarms/${id}/ack`)
export const resolveAlarm = (id) => api.post(`/alarms/${id}/resolve`)
export const getAlarmStats = () => api.get('/alarms/stats')

export default api
