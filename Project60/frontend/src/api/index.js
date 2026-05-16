import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const getStatistics = () => api.get('/statistics/')

export const getStudents = () => api.get('/students/')
export const createStudent = (data) => api.post('/students/', data)
export const updateStudent = (id, data) => api.put(`/students/${id}/`, data)
export const deleteStudent = (id) => api.delete(`/students/${id}/`)

export const getCourses = () => api.get('/courses/')
export const createCourse = (data) => api.post('/courses/', data)
export const updateCourse = (id, data) => api.put(`/courses/${id}/`, data)
export const deleteCourse = (id) => api.delete(`/courses/${id}/`)

export const getTeachers = () => api.get('/teachers/')
export const createTeacher = (data) => api.post('/teachers/', data)
export const updateTeacher = (id, data) => api.put(`/teachers/${id}/`, data)
export const deleteTeacher = (id) => api.delete(`/teachers/${id}/`)

export const getClasses = () => api.get('/classes/')
export const createClass = (data) => api.post('/classes/', data)
export const updateClass = (id, data) => api.put(`/classes/${id}/`, data)
export const deleteClass = (id) => api.delete(`/classes/${id}/`)

export const getEnrollments = () => api.get('/enrollments/')
export const createEnrollment = (data) => api.post('/enrollments/', data)
export const enrollAndPay = (data) => api.post('/enroll-and-pay/', data)

export const getPayments = () => api.get('/payments/')
export const createPayment = (data) => api.post('/payments/', data)

export const getClassRecords = () => api.get('/class-records/')
export const createClassRecord = (data) => api.post('/class-records/', data)

export const getAttendances = () => api.get('/attendances/')

export default api
