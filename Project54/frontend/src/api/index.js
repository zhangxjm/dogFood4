import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
})

export const packagesAPI = {
  getAll: () => api.get('/packages'),
  getOne: (id) => api.get(`/packages/${id}`),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`)
}

export const petsAPI = {
  getAll: () => api.get('/pets'),
  getOne: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post('/pets', data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  delete: (id) => api.delete(`/pets/${id}`)
}

export const reservationsAPI = {
  getAll: () => api.get('/reservations'),
  getOne: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  updateStatus: (id, status) => api.put(`/reservations/${id}/status`, { status }),
  delete: (id) => api.delete(`/reservations/${id}`),
  checkAvailability: (data) => api.post('/reservations/check-availability', data)
}

export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  getOne: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`)
}

export const statisticsAPI = {
  get: () => api.get('/statistics')
}

export default api
