import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  response => {
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || '请求失败')
  },
  error => {
    console.error('API Error:', error)
    throw error
  }
)

export default {
  getStats() {
    return api.get('/transactions/stats')
  },
  
  getCardTypes() {
    return api.get('/card-types')
  },
  
  getMembers() {
    return api.get('/members')
  },
  
  getMember(id) {
    return api.get(`/members/${id}`)
  },
  
  addMember(data) {
    return api.post('/members', data)
  },
  
  updateMember(id, data) {
    return api.put(`/members/${id}`, data)
  },
  
  buyCard(memberId, cardTypeId) {
    return api.post(`/members/${memberId}/buy-card`, { card_type_id: cardTypeId })
  },
  
  recharge(memberId, memberCardId, amount, sessions) {
    return api.post(`/members/${memberId}/recharge`, { 
      member_card_id: memberCardId, 
      amount: Number(amount), 
      sessions: Number(sessions) 
    })
  },
  
  getTrainers() {
    return api.get('/trainers')
  },
  
  getAppointments() {
    return api.get('/appointments')
  },
  
  addAppointment(data) {
    return api.post('/appointments', data)
  },
  
  confirmAppointment(id) {
    return api.put(`/appointments/${id}/confirm`)
  },
  
  completeAppointment(id) {
    return api.put(`/appointments/${id}/complete`)
  },
  
  cancelAppointment(id) {
    return api.put(`/appointments/${id}/cancel`)
  },
  
  getTransactions(memberId) {
    return api.get(`/transactions?member_id=${memberId}`)
  },
  
  getReminders() {
    return api.get('/reminders?is_read=0')
  },
  
  getExpiringMembers() {
    return api.get('/reminders/expiring-members')
  },
  
  markReminderRead(id) {
    return api.put(`/reminders/${id}/read`)
  }
}