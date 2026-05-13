import request from './request'

export const getActiveGroups = (params) => request.get('/groups/active/', { params })

export const getGroupDetail = (id) => request.get(`/groups/${id}/`)

export const createGroup = (data) => request.post('/groups/', data)

export const endGroup = (id) => request.post(`/groups/${id}/end/`)
