import request from './request'

export const getCategories = () => {
  return request({
    url: '/products/categories',
    method: 'GET'
  })
}

export const getProducts = (categoryId = null) => {
  const params = categoryId ? `?categoryId=${categoryId}` : ''
  return request({
    url: `/products${params}`,
    method: 'GET'
  })
}

export const getProductById = (id) => {
  return request({
    url: `/products/${id}`,
    method: 'GET'
  })
}

export const createOrder = (data) => {
  return request({
    url: '/orders',
    method: 'POST',
    data
  })
}

export const getOrders = (status = null) => {
  const params = status ? `?status=${status}` : ''
  return request({
    url: `/orders${params}`,
    method: 'GET'
  })
}

export const getOrderById = (id) => {
  return request({
    url: `/orders/${id}`,
    method: 'GET'
  })
}

export const updateOrderStatus = (id, status) => {
  return request({
    url: `/orders/${id}/status`,
    method: 'PUT',
    data: { status }
  })
}
