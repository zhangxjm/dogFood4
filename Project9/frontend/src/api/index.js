import axios from 'axios';

const API_BASE_URL = window.location.origin;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const booksApi = {
  getAll: (params) => api.get('/api/books', { params }),
  getById: (id) => api.get(`/api/books/${id}`),
  create: (data) => api.post('/api/books', data),
  update: (id, data) => api.put(`/api/books/${id}`, data),
  delete: (id) => api.delete(`/api/books/${id}`),
  createByIsbn: (isbn) => api.post(`/api/books/isbn/${isbn}`),
  getCategories: () => api.get('/api/books/categories/list'),
};

export const readersApi = {
  getAll: (params) => api.get('/api/readers', { params }),
  getById: (id) => api.get(`/api/readers/${id}`),
  getByCard: (cardNumber) => api.get(`/api/readers/card/${cardNumber}`),
  create: (data) => api.post('/api/readers', data),
  update: (id, data) => api.put(`/api/readers/${id}`, data),
  delete: (id) => api.delete(`/api/readers/${id}`),
};

export const borrowsApi = {
  getAll: (params) => api.get('/api/borrows', { params }),
  create: (data) => api.post('/api/borrows', data),
  returnBook: (id) => api.post(`/api/borrows/${id}/return`),
  payFine: (id) => api.post(`/api/borrows/${id}/pay-fine`),
  getReaderActive: (readerId) => api.get(`/api/borrows/reader/${readerId}/active`),
};

export const reservationsApi = {
  getAll: (params) => api.get('/api/reservations', { params }),
  create: (data) => api.post('/api/reservations', data),
  cancel: (id) => api.post(`/api/reservations/${id}/cancel`),
  complete: (id) => api.post(`/api/reservations/${id}/complete`),
};

export const statsApi = {
  getOverview: () => api.get('/api/stats/overview'),
  getBorrowStats: () => api.get('/api/stats/borrows'),
  getOverdueStats: () => api.get('/api/stats/overdue'),
  getTrending: () => api.get('/api/stats/trending'),
};

export const adminApi = {
  importBooks: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/admin/import/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportBooks: () => api.get('/api/admin/export/books', { responseType: 'blob' }),
  importReaders: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/admin/import/readers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportReaders: () => api.get('/api/admin/export/readers', { responseType: 'blob' }),
};

export default api;
