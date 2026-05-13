import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const roomApi = {
  list: () => request.get('/rooms'),
  create: (data) => request.post('/rooms', data),
  update: (id, data) => request.put(`/rooms/${id}`, data),
  delete: (id) => request.delete(`/rooms/${id}`),
  getResidents: (id) => request.get(`/rooms/${id}/residents`)
}

export const residentApi = {
  list: () => request.get('/residents'),
  create: (data) => request.post('/residents', data),
  update: (id, data) => request.put(`/residents/${id}`, data),
  delete: (id) => request.delete(`/residents/${id}`),
  exportCSV: () => '/api/residents/export/csv'
}

export const utilityApi = {
  list: (params) => request.get('/utilities', { params }),
  create: (data) => request.post('/utilities', data),
  update: (id, data) => request.put(`/utilities/${id}`, data),
  delete: (id) => request.delete(`/utilities/${id}`),
  stats: (params) => request.get('/utilities/stats', { params })
}

export default request
