import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  createOrder(data) {
    return api.post('/orders', data)
  },
  getOrders() {
    return api.get('/orders')
  },
  getPendingOrders() {
    return api.get('/orders/pending')
  },
  getTodayOrders() {
    return api.get('/orders/today')
  },
  getStatistics() {
    return api.get('/orders/statistics')
  },
  getOrder(id) {
    return api.get(`/orders/${id}`)
  },
  updateOrder(id, data) {
    return api.put(`/orders/${id}`, data)
  },
  callOrder(orderNumber) {
    return api.post(`/orders/call/${orderNumber}`)
  },
  updateStatus(orderId, status) {
    return api.post(`/orders/status/${orderId}/${status}`)
  }
}
