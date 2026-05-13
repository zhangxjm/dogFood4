import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 5000
})

export const getClasses = () => api.get('/classes')
export const createClass = (data) => api.post('/classes', data)
export const deleteClass = (id) => api.delete(`/classes/${id}`)

export const getStudents = (classId) => {
  const params = classId ? { class_id: classId } : {}
  return api.get('/students', { params })
}
export const getStudent = (id) => api.get(`/students/${id}`)
export const createStudent = (data) => api.post('/students', data)
export const updateStudent = (id, data) => api.put(`/students/${id}`, data)
export const deleteStudent = (id) => api.delete(`/students/${id}`)

export const getScores = (studentId) => {
  const params = studentId ? { student_id: studentId } : {}
  return api.get('/scores', { params })
}
export const createScore = (data) => api.post('/scores', data)
export const deleteScore = (id) => api.delete(`/scores/${id}`)

export default api
