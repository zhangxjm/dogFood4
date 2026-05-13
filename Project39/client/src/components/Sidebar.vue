<script setup lang="ts">
import { computed } from 'vue';
import { useCategoryStore } from '../stores/category';
import { useBookmarkStore } from '../stores/bookmark';

const emit = defineEmits<{
  (e: 'open-bookmark-modal'): void;
  (e: 'open-category-modal'): void;
}>();

const categoryStore = useCategoryStore();
const bookmarkStore = useBookmarkStore();

const selectedCategoryId = computed({
  get: () => bookmarkStore.searchParams.categoryId || '',
  set: (value: string) => {
    bookmarkStore.searchBookmarks({
      ...bookmarkStore.searchParams,
      categoryId: value || undefined,
    });
  },
});

const showFavorites = computed({
  get: () => bookmarkStore.searchParams.isFavorite || false,
  set: (value: boolean) => {
    bookmarkStore.searchBookmarks({
      ...bookmarkStore.searchParams,
      isFavorite: value || undefined,
    });
  },
});
</script>

<template>
  <aside class="sidebar">
    <button class="btn btn-primary w-full" @click="emit('open-bookmark-modal')">
      <span>➕</span>
      添加书签
    </button>

    <nav class="nav-section">
      <button
        class="nav-item"
        :class="{ active: !selectedCategoryId && !showFavorites }"
        @click="selectedCategoryId = ''; showFavorites = false"
      >
        <span class="nav-icon">🏠</span>
        <span>全部书签</span>
      </button>
      
      <button
        class="nav-item"
        :class="{ active: showFavorites }"
        @click="showFavorites = !showFavorites"
      >
        <span class="nav-icon">⭐</span>
        <span>收藏夹</span>
      </button>
    </nav>

    <div class="category-section">
      <div class="category-header">
        <span class="category-title">分类</span>
        <button class="btn btn-icon btn-sm" title="添加分类" @click="emit('open-category-modal')">
          ➕
        </button>
      </div>
      
      <nav v-if="categoryStore.categories.length > 0" class="category-list">
        <button
          v-for="category in categoryStore.categories"
          :key="category._id"
          class="nav-item category-item"
          :class="{ active: selectedCategoryId === category._id }"
          @click="selectedCategoryId = category._id"
        >
          <span class="category-dot" :style="{ backgroundColor: category.color }"></span>
          <span class="truncate">{{ category.name }}</span>
        </button>
      </nav>
      
      <div v-else class="empty-categories">
        <span>暂无分类</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.w-full {
  width: 100%;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: left;
  transition: all 0.15s;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 500;
}

.nav-icon {
  font-size: 16px;
}

.category-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.category-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-item {
  padding: 8px 12px;
}

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-categories {
  padding: 16px 12px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }
}
</style>
