import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const studentApi = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  search: (params) => api.get('/students/search', { params })
}

export const courseApi = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  search: (params) => api.get('/courses/search', { params })
}

export const studentCourseApi = {
  getAll: () => api.get('/student-courses'),
  getById: (id) => api.get(`/student-courses/${id}`),
  getByStudentId: (studentId) => api.get(`/student-courses/student/${studentId}`),
  getByCourseId: (courseId) => api.get(`/student-courses/course/${courseId}`),
  create: (data) => api.post('/student-courses', data),
  update: (id, data) => api.put(`/student-courses/${id}`, data),
  delete: (id) => api.delete(`/student-courses/${id}`)
}

export const paymentApi = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByStudentId: (studentId) => api.get(`/payments/student/${studentId}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`)
}

export default api
