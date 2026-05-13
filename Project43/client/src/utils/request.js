import axios from 'axios';
import { showToast } from 'vant';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败';
    showToast({ type: 'fail', message });
    return Promise.reject(error);
  }
);

export const productApi = {
  getAll: () => request.get('/products'),
  getActive: () => request.get('/products/active'),
  create: (data) => request.post('/products', data),
  update: (id, data) => request.put(`/products/${id}`, data),
  delete: (id) => request.delete(`/products/${id}`),
};

export const orderApi = {
  getAll: (status) => request.get('/orders', { params: { status } }),
  getOne: (id) => request.get(`/orders/${id}`),
  create: (data) => request.post('/orders', data),
  updateStatus: (id, status) => request.patch(`/orders/${id}/status`, { status }),
  markAsPrinted: (id) => request.patch(`/orders/${id}/print`),
  delete: (id) => request.delete(`/orders/${id}`),
};

export const statisticsApi = {
  getOverview: () => request.get('/statistics/overview'),
  getDailySales: (startDate, endDate) =>
    request.get('/statistics/daily-sales', { params: { startDate, endDate } }),
  getProductRanking: (startDate, endDate, limit = 10) =>
    request.get('/statistics/product-ranking', { params: { startDate, endDate, limit } }),
};

export default request;
