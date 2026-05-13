import http from '../utils/http';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

const BASE_URL = '/categories';

export const categoryApi = {
  getAll: () => http.get<Category[]>(BASE_URL),
  getById: (id: string) => http.get<Category>(`${BASE_URL}/${id}`),
  create: (data: CreateCategoryDto) => http.post<Category>(BASE_URL, data),
  update: (id: string, data: UpdateCategoryDto) => http.patch<Category>(`${BASE_URL}/${id}`, data),
  delete: (id: string) => http.delete(`${BASE_URL}/${id}`),
};
