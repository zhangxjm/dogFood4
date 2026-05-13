import axios from 'axios'

const baseURL = '/api'

const request = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const healthCheck = () => request.get('/health')

export const getCategories = () => request.get('/categories')
export const getCategory = (id) => request.get(`/categories/${id}`)
export const createCategory = (data) => request.post('/categories', data)
export const updateCategory = (id, data) => request.put(`/categories/${id}`, data)
export const deleteCategory = (id) => request.delete(`/categories/${id}`)

export const getProducts = (categoryId) => {
  if (categoryId) {
    return request.get(`/products?category_id=${categoryId}`)
  }
  return request.get('/products')
}
export const getProduct = (id) => request.get(`/products/${id}`)
export const createProduct = (data) => request.post('/products', data)
export const updateProduct = (id, data) => request.put(`/products/${id}`, data)
export const deleteProduct = (id) => request.delete(`/products/${id}`)

export default {
  healthCheck,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
}
