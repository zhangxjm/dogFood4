import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
})

api.interceptors.response.use(
  response => {
    if (response.data.code === 200) {
      return response.data.data
    }
    return Promise.reject(response.data.message)
  },
  error => {
    return Promise.reject(error)
  }
)

export const studentApi = {
  list: () => api.get('/students'),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  get: (id) => api.get(`/students/${id}`)
}

export const coachApi = {
  list: () => api.get('/coaches'),
  create: (data) => api.post('/coaches', data),
  update: (id, data) => api.put(`/coaches/${id}`, data),
  delete: (id) => api.delete(`/coaches/${id}`),
  get: (id) => api.get(`/coaches/${id}`)
}

export const reservationApi = {
  list: () => api.get('/reservations'),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
  get: (id) => api.get(`/reservations/${id}`)
}

export const studyHourApi = {
  list: () => api.get('/studyhours'),
  create: (data) => api.post('/studyhours', data),
  update: (id, data) => api.put(`/studyhours/${id}`, data),
  delete: (id) => api.delete(`/studyhours/${id}`),
  get: (id) => api.get(`/studyhours/${id}`),
  getByStudent: (studentId) => api.get(`/studyhours/student/${studentId}`)
}

export const examScoreApi = {
  list: () => api.get('/examscores'),
  create: (data) => api.post('/examscores', data),
  update: (id, data) => api.put(`/examscores/${id}`, data),
  delete: (id) => api.delete(`/examscores/${id}`),
  get: (id) => api.get(`/examscores/${id}`),
  getByStudent: (studentId) => api.get(`/examscores/student/${studentId}`)
}

export const statisticsApi = {
  dashboard: () => api.get('/statistics/dashboard'),
  graduatedMonthly: () => api.get('/statistics/graduated-monthly'),
  passRate: () => api.get('/statistics/pass-rate')
}

export default api
