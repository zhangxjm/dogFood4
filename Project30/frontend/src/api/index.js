import request from '../utils/request'

export const categoryApi = {
  list: () => request.get('/category/list'),
  page: (params) => request.get('/category/page', { params }),
  getById: (id) => request.get(`/category/${id}`),
  add: (data) => request.post('/category', data),
  update: (data) => request.put('/category', data),
  delete: (id) => request.delete(`/category/${id}`),
  batchDelete: (ids) => request.delete('/category/batch', { data: ids })
}

export const employeeApi = {
  list: () => request.get('/employee/list'),
  page: (params) => request.get('/employee/page', { params }),
  getById: (id) => request.get(`/employee/${id}`),
  add: (data) => request.post('/employee', data),
  update: (data) => request.put('/employee', data),
  delete: (id) => request.delete(`/employee/${id}`),
  batchDelete: (ids) => request.delete('/employee/batch', { data: ids })
}

export const itemApi = {
  page: (params) => request.get('/item/page', { params }),
  getById: (id) => request.get(`/item/${id}`),
  add: (data) => request.post('/item', data),
  update: (data) => request.put('/item', data),
  delete: (id) => request.delete(`/item/${id}`),
  batchDelete: (ids) => request.delete('/item/batch', { data: ids })
}

export const requisitionApi = {
  page: (params) => request.get('/requisition/page', { params }),
  getById: (id) => request.get(`/requisition/${id}`),
  create: (data) => request.post('/requisition', data)
}
