import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const userApi = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data)
}

export const productApi = {
  uploadImages: (files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  create: (data) => api.post('/products', data),
  getById: (id) => api.get(`/products/${id}`),
  getList: (params) => api.get('/products', { params }),
  updateStatus: (id, status) => api.put(`/products/${id}/status`, null, {
    params: { status }
  })
}

export const favoriteApi = {
  add: (userId, productId) => api.post('/favorites', null, {
    params: { userId, productId }
  }),
  remove: (userId, productId) => api.delete('/favorites', {
    params: { userId, productId }
  }),
  check: (userId, productId) => api.get('/favorites/check', {
    params: { userId, productId }
  }),
  getByUser: (userId) => api.get(`/favorites/user/${userId}`)
}

export const transactionApi = {
  create: (productId, buyerId) => api.post('/transactions', null, {
    params: { productId, buyerId }
  }),
  getById: (id) => api.get(`/transactions/${id}`),
  getByBuyer: (buyerId) => api.get(`/transactions/buyer/${buyerId}`),
  getBySeller: (sellerId) => api.get(`/transactions/seller/${sellerId}`),
  updateStatus: (id, status) => api.put(`/transactions/${id}/status`, null, {
    params: { status }
  })
}

export default api
