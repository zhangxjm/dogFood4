import request from './request'

export const authAPI = {
  login: (data) => request.post('/api/auth/login', data),
  register: (data) => request.post('/api/auth/register', data),
  getCurrentUser: () => request.get('/api/auth/me'),
  updateUser: (data) => request.put('/api/auth/me', data),
  verifyStudent: (data) => request.post('/api/auth/verify', data),
  getVerifyStatus: () => request.get('/api/auth/verify/status'),
}

export const productAPI = {
  getList: (params) => request.get('/api/products', { params }),
  getDetail: (id) => request.get(`/api/products/${id}`),
  create: (data) => request.post('/api/products', data),
  update: (id, data) => request.put(`/api/products/${id}`, data),
  delete: (id) => request.delete(`/api/products/${id}`),
  toggleFavorite: (id) => request.post(`/api/products/${id}/favorite`),
  getMyList: (params) => request.get('/api/products/mine', { params }),
  getFavorites: (params) => request.get('/api/products/favorites/list', { params }),
}

export const orderAPI = {
  create: (data) => request.post('/api/orders', data),
  getList: (params) => request.get('/api/orders', { params }),
  getDetail: (id) => request.get(`/api/orders/${id}`),
  pay: (id) => request.post(`/api/orders/${id}/pay`),
  confirm: (id) => request.post(`/api/orders/${id}/confirm`),
  cancel: (id) => request.post(`/api/orders/${id}/cancel`),
}

export const chatAPI = {
  getConversations: () => request.get('/api/chat/conversations'),
  createConversation: (data) => request.post('/api/chat/conversations', data),
  getMessages: (conversationId, params) =>
    request.get(`/api/chat/conversations/${conversationId}/messages`, { params }),
  markRead: (conversationId) =>
    request.post(`/api/chat/conversations/${conversationId}/messages/read`),
}

export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/api/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadImages: (files) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    return request.post('/api/uploads/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const campusAPI = {
  getZones: (campus) => request.get('/api/campus/zones', { params: { campus } }),
  getColleges: (campus) => request.get('/api/campus/zones/colleges', { params: { campus } }),
  getBuildings: (campus, college) => request.get('/api/campus/zones/buildings', { params: { campus, college } }),
  getDormitories: (campus) => request.get('/api/campus/zones/dormitories', { params: { campus } }),
  getRecommendations: (params) => request.get('/api/campus/recommendations', { params }),
  getProductsByZone: (params) => request.get('/api/campus/products/by-zone', { params }),
  getZoneStats: () => request.get('/api/campus/zones/stats'),
}

export const demandAPI = {
  getList: (params) => request.get('/api/demands', { params }),
  getDetail: (id) => request.get(`/api/demands/${id}`),
  create: (data) => request.post('/api/demands', data),
  getMatches: (id) => request.get(`/api/demands/${id}/matches`),
  matchProduct: (demandId, productId) => request.post(`/api/demands/${demandId}/match/${productId}`),
  close: (id) => request.post(`/api/demands/${id}/close`),
  cancel: (id) => request.post(`/api/demands/${id}/cancel`),
  getMyList: (params) => request.get('/api/demands/mine', { params }),
  getForProducts: (params) => request.get('/api/demands/recommendations/for-products', { params }),
}
