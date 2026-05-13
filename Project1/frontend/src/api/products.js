import request from './request'

export const getCategories = () => request.get('/products/categories/')

export const getPublicProducts = (params) => request.get('/products/public/', { params })

export const getProductDetail = (id) => request.get(`/products/${id}/`)

export const getMyProducts = (params) => request.get('/products/mine/', { params })

export const createProduct = (data) => request.post('/products/', data)

export const updateProduct = (id, data) => request.patch(`/products/${id}/`, data)

export const deleteProduct = (id) => request.delete(`/products/${id}/`)

export const upProduct = (id) => request.post(`/products/${id}/up/`)

export const downProduct = (id) => request.post(`/products/${id}/down/`)
