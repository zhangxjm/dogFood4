import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
})

api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => response,
  error => {
    console.error('响应错误:', error)
    if (error.response) {
      console.error('错误状态码:', error.response.status)
      console.error('错误数据:', error.response.data)
    } else if (error.request) {
      console.error('无响应，请求已发出但无响应')
    } else {
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

export const productAPI = {
  getAll: () => api.get('/products'),
  getByCategory: (category) => api.get(`/products/category/${category}`)
}

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getByNo: (orderNo) => api.get(`/orders/${orderNo}`)
}

export const reportAPI = {
  getDaily: (date) => api.get('/reports/daily', { params: { date } })
}

export default api
