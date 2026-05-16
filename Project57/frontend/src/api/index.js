import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const movieApi = {
  getAll: () => api.get('/movies'),
  getById: (id) => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`)
}

export const scheduleApi = {
  getAll: (movieId) => api.get('/schedules', { params: { movieId } }),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`)
}

export const seatApi = {
  getBySchedule: (scheduleId) => api.get(`/seats/schedule/${scheduleId}`),
  lock: (seatIds, userId) => api.post('/seats/lock', { seatIds, userId }),
  unlock: (seatIds) => api.post('/seats/unlock', { seatIds })
}

export const orderApi = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  cancel: (id) => api.put(`/orders/${id}/cancel`)
}

export const statsApi = {
  getBoxOffice: () => api.get('/stats/boxoffice'),
  getDaily: (startDate, endDate) => api.get('/stats/daily', { params: { startDate, endDate } })
}

export default api
