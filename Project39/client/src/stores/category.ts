import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { categoryApi } from '../api/categories';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);

  const categoryOptions = computed(() => [
    { _id: '', name: '未分类', color: '#9ca3af' },
    ...categories.value,
  ]);

  async function fetchCategories() {
    try {
      loading.value = true;
      const response = await categoryApi.getAll();
      categories.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function createCategory(data: CreateCategoryDto) {
    const response = await categoryApi.create(data);
    categories.value.push(response.data);
    return response.data;
  }

  async function updateCategory(id: string, data: UpdateCategoryDto) {
    const response = await categoryApi.update(id, data);
    const index = categories.value.findIndex((c) => c._id === id);
    if (index !== -1) {
      categories.value[index] = response.data;
    }
    return response.data;
  }

  async function deleteCategory(id: string) {
    await categoryApi.delete(id);
    categories.value = categories.value.filter((c) => c._id !== id);
  }

  function getCategoryById(id: string | null): Category | null {
    if (!id) return null;
    return categories.value.find((c) => c._id === id) || null;
  }

  return {
    categories,
    loading,
    categoryOptions,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
});
