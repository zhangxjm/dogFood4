import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const technicianApi = {
  list: (params = {}) => api.get('/technicians/', { params }),
  get: (id) => api.get(`/technicians/${id}/`),
  create: (data) => api.post('/technicians/', data),
  update: (id, data) => api.put(`/technicians/${id}/`, data),
  delete: (id) => api.delete(`/technicians/${id}/`),
  active: () => api.get('/technicians/active/')
}

export const scheduleApi = {
  list: (params = {}) => api.get('/schedules/', { params }),
  get: (id) => api.get(`/schedules/${id}/`),
  create: (data) => api.post('/schedules/', data),
  update: (id, data) => api.put(`/schedules/${id}/`, data),
  delete: (id) => api.delete(`/schedules/${id}/`),
  week: () => api.get('/schedules/week/'),
  month: () => api.get('/schedules/month/'),
  batchCreate: (data) => api.post('/schedules/batch_create/', data)
}

export const SHIFT_OPTIONS = [
  { value: 'morning', label: '早班' },
  { value: 'afternoon', label: '午班' },
  { value: 'evening', label: '晚班' },
  { value: 'full', label: '全天' },
  { value: 'off', label: '休息' }
]

export const STATUS_OPTIONS = [
  { value: 'active', label: '在职' },
  { value: 'inactive', label: '离职' }
]

export const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' }
]

export default api
