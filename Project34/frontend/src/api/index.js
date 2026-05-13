import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const bookApi = {
  getAll: (params = {}) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  getStats: () => api.get('/books/stats'),
  create: (book) => api.post('/books', book),
  update: (id, book) => api.put(`/books/${id}`, book),
  delete: (id) => api.delete(`/books/${id}`)
}

export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (category) => api.post('/categories', category),
  update: (id, category) => api.put(`/categories/${id}`, category),
  delete: (id) => api.delete(`/categories/${id}`)
}

export const noteApi = {
  getByBookId: (bookId) => api.get(`/books/${bookId}/notes`),
  create: (bookId, note) => api.post(`/books/${bookId}/notes`, note),
  update: (bookId, noteId, note) => api.put(`/books/${bookId}/notes/${noteId}`, note),
  delete: (bookId, noteId) => api.delete(`/books/${bookId}/notes/${noteId}`)
}

export default api
