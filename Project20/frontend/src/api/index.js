import request from '../utils/request'

export const getDrinks = () => {
  return request({
    url: '/api/drinks',
    method: 'GET'
  })
}

export const getDrinkById = (id) => {
  return request({
    url: `/api/drinks/${id}`,
    method: 'GET'
  })
}

export const createOrder = (data) => {
  return request({
    url: '/api/orders',
    method: 'POST',
    data
  })
}

export const getOrders = () => {
  return request({
    url: '/api/orders',
    method: 'GET'
  })
}

export const getOrderById = (id) => {
  return request({
    url: `/api/orders/${id}`,
    method: 'GET'
  })
}

export const updateOrderStatus = (id, status) => {
  return request({
    url: `/api/orders/${id}/status`,
    method: 'PUT',
    data: { status }
  })
}
