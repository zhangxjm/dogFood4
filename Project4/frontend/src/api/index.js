import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const deviceAPI = {
  getAll: () => api.get('/devices'),
  getOne: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  delete: (id) => api.delete(`/devices/${id}`),
  getHistory: (id) => api.get(`/devices/${id}/history`)
}

export const groupAPI = {
  getAll: () => api.get('/groups'),
  create: (data) => api.post('/groups', data)
}

export const alertAPI = {
  getRecent: () => api.get('/alerts')
}

export const statsAPI = {
  get: () => api.get('/statistics')
}

export default api
