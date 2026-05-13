import request from './request'

export const createOrder = (data) => request.post('/orders/', data)

export const getOrders = (params) => request.get('/orders/', { params })

export const getOrderDetail = (id) => request.get(`/orders/${id}/`)

export const payOrder = (id, data) => request.post(`/orders/${id}/pay/`, data)

export const cancelOrder = (id) => request.post(`/orders/${id}/cancel/`)

export const confirmOrder = (id) => request.post(`/orders/${id}/confirm/`)

export const getLeaderOrders = (params) => request.get('/orders/leader_orders/', { params })

export const verifyOrder = (data) => request.post('/orders/verify/', data)
