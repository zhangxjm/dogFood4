import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUserProfile: (id) => api.get(`/auth/${id}`)
}

export const guideAPI = {
  getGuides: (params) => api.get('/guides', { params }),
  getHotGuides: (limit) => api.get('/guides/hot', { params: { limit } }),
  getGuide: (id) => api.get(`/guides/${id}`),
  createGuide: (data) => api.post('/guides', data),
  updateGuide: (id, data) => api.put(`/guides/${id}`, data),
  deleteGuide: (id) => api.delete(`/guides/${id}`),
  uploadImages: (files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    return api.post('/guides/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  toggleLike: (id) => api.post(`/guides/${id}/like`),
  getLikeStatus: (id) => api.get(`/guides/${id}/like-status`),
  getUserGuides: (userId, params) => api.get(`/guides/user/${userId}`, { params })
}

export const commentAPI = {
  createComment: (data) => api.post('/comments', data),
  getGuideComments: (guideId) => api.get(`/comments/guide/${guideId}`),
  deleteComment: (id) => api.delete(`/comments/${id}`)
}

export const categoryAPI = {
  getCategories: () => api.get('/categories')
}

export default api
