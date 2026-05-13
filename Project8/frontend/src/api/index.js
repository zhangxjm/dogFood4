import request from '@/utils/request'

export const getTableByNo = (tableNo) => request.get(`/tables/no/${tableNo}`)
export const getTables = () => request.get('/tables')
export const createTable = (data) => request.post('/tables', data)
export const regenerateQRCode = (id) => request.post(`/tables/${id}/regenerate-qrcode`)

export const getCategories = () => request.get('/categories')

export const getDishes = () => request.get('/dishes')
export const getDishesByCategory = (categoryId) => request.get(`/dishes/category/${categoryId}`)

export const createOrder = (data) => request.post('/orders', data)
export const addOrderItems = (orderNo, data) => request.post(`/orders/${orderNo}/add`, data)
export const getOrder = (orderNo) => request.get(`/orders/${orderNo}`)
export const getPendingOrders = () => request.get('/orders/pending')
export const getOrdersByTable = (tableId) => request.get(`/orders/table/${tableId}`)
export const updateOrderStatus = (orderNo, status) => request.put(`/orders/${orderNo}/status?status=${status}`)
export const markOrderPrinted = (orderNo) => request.put(`/orders/${orderNo}/printed`)
export const getDailyStats = (date) => request.get(`/orders/stats/daily${date ? `?date=${date}` : ''}`)
