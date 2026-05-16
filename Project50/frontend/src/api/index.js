import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const getBooks = () => api.get('/books')
export const getBook = (id) => {
  if (!id || id === 'undefined') return Promise.reject(new Error('Invalid book ID'))
  return api.get(`/books/${id}`)
}
export const createBook = (data) => api.post('/books', data)
export const updateBook = (id, data) => {
  if (!id || id === 'undefined') return Promise.reject(new Error('Invalid book ID'))
  return api.put(`/books/${id}`, data)
}
export const deleteBook = (id) => {
  if (!id || id === 'undefined') return Promise.reject(new Error('Invalid book ID'))
  return api.delete(`/books/${id}`)
}

export const getReaders = () => api.get('/readers')
export const getReader = (id) => {
  if (!id || id === 'undefined') return Promise.reject(new Error('Invalid reader ID'))
  return api.get(`/readers/${id}`)
}
export const createReader = (data) => api.post('/readers', data)
export const updateReader = (id, data) => {
  if (!id || id === 'undefined') return Promise.reject(new Error('Invalid reader ID'))
  return api.put(`/readers/${id}`, data)
}
export const deleteReader = (id) => {
  if (!id || id === 'undefined') return Promise.reject(new Error('Invalid reader ID'))
  return api.delete(`/readers/${id}`)
}

export const getBorrows = () => api.get('/borrows')
export const createBorrow = (data) => api.post('/borrows', data)
export const returnBook = (data) => api.post('/borrows/return', data)
export const payFine = (id) => api.post(`/borrows/${id}/pay-fine`)

export const getStatistics = () => api.get('/statistics')

export default api
