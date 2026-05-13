import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const getCategories = () => api.get('/categories')
export const getItems = (params = {}) => api.get('/items', { params })
export const getItem = (id) => api.get(`/items/${id}`)
export const createItem = (data) => api.post('/items', data)
export const updateItem = (id, data) => api.put(`/items/${id}`, data)
export const updateItemStatus = (id, status) => api.put(`/items/${id}/status`, { status })
export const deleteItem = (id) => api.delete(`/items/${id}`)

export default api
