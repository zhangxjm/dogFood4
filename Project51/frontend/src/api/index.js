import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const departmentApi = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`)
}

export const doctorApi = {
  getAll: () => api.get('/doctors'),
  getByDepartment: (departmentId) => api.get(`/doctors/department/${departmentId}`),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`)
}

export const scheduleApi = {
  getByDate: (date) => api.get(`/schedules/date/${date}`),
  getByDepartmentAndDate: (departmentId, date) => api.get(`/schedules/department/${departmentId}/date/${date}`),
  getByDateRange: (startDate, endDate) => api.get('/schedules/range', { params: { startDate, endDate } }),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`)
}

export const registrationApi = {
  getAll: () => api.get('/registrations'),
  getByPhone: (phone) => api.get(`/registrations/phone/${phone}`),
  getById: (id) => api.get(`/registrations/${id}`),
  create: (data) => api.post('/registrations', data),
  cancel: (id) => api.put(`/registrations/${id}/cancel`),
  updateStatus: (id, status) => api.put(`/registrations/${id}/status`, null, { params: { status } })
}

export const statisticsApi = {
  getDoctorVisits: (startDate, endDate) => api.get('/statistics/doctor-visits', { params: { startDate, endDate } })
}

export default api
