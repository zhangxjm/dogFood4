import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => api.post('/token/', data),
  refresh: () => api.post('/token/refresh/')
}

export const articlesAPI = {
  list: (params) => api.get('/articles/', { params }),
  get: (id) => api.get(`/articles/${id}/`),
  create: (data) => api.post('/articles/', data),
  update: (id, data) => api.put(`/articles/${id}/`, data),
  delete: (id) => api.delete(`/articles/${id}/`),
  recent: () => api.get('/articles/recent/')
}

export const categoriesAPI = {
  list: () => api.get('/categories/'),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`)
}

export const tagsAPI = {
  list: () => api.get('/tags/'),
  create: (data) => api.post('/tags/', data),
  update: (id, data) => api.put(`/tags/${id}/`, data),
  delete: (id) => api.delete(`/tags/${id}/`)
}

export const commentsAPI = {
  list: (params) => api.get('/comments/', { params }),
  create: (data) => api.post('/comments/', data),
  approve: (id) => api.post(`/comments/${id}/approve/`),
  reject: (id) => api.post(`/comments/${id}/reject/`),
  pending: () => api.get('/comments/pending/')
}

export const statsAPI = {
  dashboard: () => api.get('/dashboard/stats/'),
  visitors: () => api.get('/visitors/'),
  daily: () => api.get('/daily-stats/')
}

export default api
