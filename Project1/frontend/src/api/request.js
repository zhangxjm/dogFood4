import axios from 'axios'
import { showToast } from 'vant'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

function getErrorMessage(errorData) {
  if (!errorData) return '请求失败'
  if (errorData.detail) return errorData.detail
  if (typeof errorData === 'string') return errorData
  if (typeof errorData === 'object') {
    const firstError = Object.values(errorData)[0]
    if (Array.isArray(firstError)) {
      return firstError[0] || '请求失败'
    }
    if (typeof firstError === 'string') {
      return firstError
    }
  }
  return '请求失败'
}

request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        showToast('请先登录')
      } else {
        const message = getErrorMessage(error.response.data)
        showToast(message)
      }
    } else {
      showToast('网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
