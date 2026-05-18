import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const serviceApi = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const workerApi = {
  getAll: (skill, verifiedOnly) => api.get('/workers', { params: { skill, verifiedOnly } }),
  getById: (id) => api.get(`/workers/${id}`),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
  delete: (id) => api.delete(`/workers/${id}`),
};

export const certificationApi = {
  uploadDocument: (workerId, formData) => 
    api.post(`/certifications/upload/${workerId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getWorkerCertifications: (workerId) => 
    api.get(`/certifications/worker/${workerId}`),
  getPendingAudits: () => 
    api.get('/certifications/pending'),
  getAllCertifications: (status) => 
    api.get('/certifications/all', { params: { status } }),
  auditCertification: (workerId, data) => 
    api.put(`/certifications/audit/${workerId}`, data),
  deleteDocument: (workerId, documentId) => 
    api.delete(`/certifications/document/${workerId}/${documentId}`),
};

export const bookingApi = {
  getAll: (status) => api.get('/bookings', { params: { status } }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  getAvailableSlots: (workerId, serviceId, date) => 
    api.get('/bookings/available-slots', { 
      params: { workerId, serviceId, date: date.format('YYYY-MM-DD') } 
    }),
};

export const reviewApi = {
  getAll: (workerId, serviceId) => api.get('/reviews', { params: { workerId, serviceId } }),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const statsApi = {
  getOverview: () => api.get('/stats/overview'),
  getBookingsByStatus: () => api.get('/stats/bookings-by-status'),
  getRevenueByService: () => api.get('/stats/revenue-by-service'),
  getRevenueTrend: (days) => api.get('/stats/revenue-trend', { params: { days } }),
  getTopWorkers: () => api.get('/stats/top-workers'),
};

export default api;
