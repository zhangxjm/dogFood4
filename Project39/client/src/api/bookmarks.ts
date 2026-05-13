import http from '../utils/http';
import { Bookmark, CreateBookmarkDto, UpdateBookmarkDto, SearchParams } from '../types';

const BASE_URL = '/bookmarks';

export const bookmarkApi = {
  getAll: (params?: SearchParams) => http.get<Bookmark[]>(BASE_URL, { params }),
  getById: (id: string) => http.get<Bookmark>(`${BASE_URL}/${id}`),
  create: (data: CreateBookmarkDto) => http.post<Bookmark>(BASE_URL, data),
  update: (id: string, data: UpdateBookmarkDto) => http.patch<Bookmark>(`${BASE_URL}/${id}`, data),
  delete: (id: string) => http.delete(`${BASE_URL}/${id}`),
  toggleFavorite: (id: string) => http.patch<Bookmark>(`${BASE_URL}/${id}/toggle-favorite`),
};
