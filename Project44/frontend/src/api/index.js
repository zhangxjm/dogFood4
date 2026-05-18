import request from '../utils/request'

export const login = (data) => request.post('/auth/login', data)

export const createLeave = (data) => request.post('/leaves', data)
export const getMyLeaves = () => request.get('/leaves/my')
export const getLeaveDetail = (id) => request.get(`/leaves/${id}`)
export const getPendingFirst = () => request.get('/leaves/pending-first')
export const getPendingSecond = () => request.get('/leaves/pending-second')
export const getApproved = () => request.get('/leaves/approved')
export const getRejected = () => request.get('/leaves/rejected')
export const approveFirst = (id, data) => request.post(`/leaves/${id}/approve-first`, data)
export const approveSecond = (id, data) => request.post(`/leaves/${id}/approve-second`, data)
export const getByClass = (className) => request.get(`/leaves/class/${className}`)
export const getAllLeaves = () => request.get('/leaves/all')
export const exportExcel = () => {
  window.location.href = '/api/leaves/export'
}

export const getClassStatistics = (params) => request.get('/statistics/class', { params })
export const getAllClassStatistics = (params) => request.get('/statistics/all-classes', { params })
export const getStatisticsByLeaveType = (params) => request.get('/statistics/by-leave-type', { params })

export const getAllLeaveTypes = () => request.get('/leave-types')
export const getEnabledLeaveTypes = () => request.get('/leave-types/enabled')
export const createLeaveType = (data) => request.post('/leave-types', data)
export const updateLeaveType = (id, data) => request.put(`/leave-types/${id}`, data)
export const toggleLeaveType = (id) => request.put(`/leave-types/${id}/toggle`)
export const deleteLeaveType = (id) => request.delete(`/leave-types/${id}`)
