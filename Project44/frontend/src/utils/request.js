import axios from 'axios'
import { showToast } from 'vant'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user && user.id) {
      config.headers['X-User-Id'] = user.id
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    showToast(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default request
