import request from './request'

export const getPublicPickupPoints = () => request.get('/pickup/public/')

export const getMyPickupPoints = () => request.get('/pickup/mine/')

export const createPickupPoint = (data) => request.post('/pickup/', data)

export const updatePickupPoint = (id, data) => request.patch(`/pickup/${id}/`, data)

export const deletePickupPoint = (id) => request.delete(`/pickup/${id}/`)
