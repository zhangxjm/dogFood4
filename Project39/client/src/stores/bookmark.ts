import { defineStore } from 'pinia';
import { ref } from 'vue';
import { bookmarkApi } from '../api/bookmarks';
import type { Bookmark, CreateBookmarkDto, UpdateBookmarkDto, SearchParams } from '../types';

export const useBookmarkStore = defineStore('bookmark', () => {
  const bookmarks = ref<Bookmark[]>([]);
  const loading = ref(false);
  const searchParams = ref<SearchParams>({});

  async function fetchBookmarks() {
    try {
      loading.value = true;
      const response = await bookmarkApi.getAll(searchParams.value);
      bookmarks.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function searchBookmarks(params: SearchParams) {
    searchParams.value = params;
    await fetchBookmarks();
  }

  async function createBookmark(data: CreateBookmarkDto) {
    const response = await bookmarkApi.create(data);
    bookmarks.value.unshift(response.data);
    return response.data;
  }

  async function updateBookmark(id: string, data: UpdateBookmarkDto) {
    const response = await bookmarkApi.update(id, data);
    const index = bookmarks.value.findIndex((b) => b._id === id);
    if (index !== -1) {
      bookmarks.value[index] = response.data;
    }
    return response.data;
  }

  async function deleteBookmark(id: string) {
    await bookmarkApi.delete(id);
    bookmarks.value = bookmarks.value.filter((b) => b._id !== id);
  }

  async function toggleFavorite(id: string) {
    const response = await bookmarkApi.toggleFavorite(id);
    const index = bookmarks.value.findIndex((b) => b._id === id);
    if (index !== -1) {
      bookmarks.value[index] = response.data;
    }
  }

  return {
    bookmarks,
    loading,
    searchParams,
    fetchBookmarks,
    searchBookmarks,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    toggleFavorite,
  };
});
