import request from './request'

export const login = (data) => request.post('/auth/token/', data)

export const refreshToken = (data) => request.post('/auth/token/refresh/', data)

export const register = (data) => request.post('/auth/users/register/', data)

export const getProfile = () => request.get('/auth/users/me/')

export const updateProfile = (data) => request.patch('/auth/users/update_profile/', data)

export const getLeaderProfile = () => request.get('/auth/leader-profiles/')

export const createLeaderProfile = (data) => request.post('/auth/leader-profiles/', data)

export const getAddresses = () => request.get('/auth/addresses/')

export const createAddress = (data) => request.post('/auth/addresses/', data)

export const updateAddress = (id, data) => request.patch(`/auth/addresses/${id}/`, data)

export const deleteAddress = (id) => request.delete(`/auth/addresses/${id}/`)

export const getDefaultAddress = () => request.get('/auth/addresses/default/')
