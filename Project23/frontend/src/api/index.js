import axios from 'axios'
import { showToast } from 'vant'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      showToast(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data
  },
  error => {
    showToast(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export const courseApi = {
  getAvailableCourses() {
    return request.get('/courses/available')
  },
  getAllCourses() {
    return request.get('/courses')
  },
  getCourseById(id) {
    return request.get(`/courses/${id}`)
  },
  createCourse(data) {
    return request.post('/courses', data)
  },
  updateCourse(id, data) {
    return request.put(`/courses/${id}`, data)
  },
  deleteCourse(id) {
    return request.delete(`/courses/${id}`)
  }
}

export const memberApi = {
  getMemberById(id) {
    return request.get(`/members/${id}`)
  },
  getMemberByPhone(phone) {
    return request.get(`/members/phone/${phone}`)
  },
  createMember(data) {
    return request.post('/members', data)
  }
}

export const reservationApi = {
  getReservationsByMember(memberId) {
    return request.get(`/reservations/member/${memberId}`)
  },
  createReservation(data) {
    return request.post('/reservations', data)
  },
  cancelReservation(id) {
    return request.put(`/reservations/${id}/cancel`)
  }
}

export default request
