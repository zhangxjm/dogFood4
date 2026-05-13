<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useBookmarkStore } from '../stores/bookmark';
import { useCategoryStore } from '../stores/category';
import type { Bookmark } from '../types';
import BookmarkCard from './BookmarkCard.vue';
import EditBookmarkModal from './EditBookmarkModal.vue';

const bookmarkStore = useBookmarkStore();
const categoryStore = useCategoryStore();
const editingBookmark = ref<Bookmark | null>(null);

onMounted(() => {
  bookmarkStore.fetchBookmarks();
});

function handleEdit(bookmark: Bookmark) {
  editingBookmark.value = bookmark;
}

function handleCloseEdit() {
  editingBookmark.value = null;
}

function getFaviconUrl(url: string): string {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return '';
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
}
</script>

<template>
  <div class="bookmark-list">
    <div class="list-header">
      <h2 class="list-title">
        {{ bookmarkStore.searchParams.isFavorite ? '⭐ 收藏夹' : '📑 全部书签' }}
      </h2>
      <span class="list-count">{{ bookmarkStore.bookmarks.length }} 个</span>
    </div>

    <div v-if="bookmarkStore.loading" class="loading-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="bookmarkStore.bookmarks.length === 0" class="empty-state">
      <div class="empty-state-icon">📌</div>
      <div class="empty-state-text">
        {{ bookmarkStore.searchParams.keyword ? '没有找到匹配的书签' : '还没有添加书签' }}
      </div>
    </div>

    <div v-else class="bookmark-grid">
      <BookmarkCard
        v-for="bookmark in bookmarkStore.bookmarks"
        :key="bookmark._id"
        :bookmark="bookmark"
        :favicon-url="getFaviconUrl(bookmark.url)"
        :format-date="formatDate"
        @edit="handleEdit"
      />
    </div>

    <EditBookmarkModal
      v-if="editingBookmark"
      :bookmark="editingBookmark"
      @close="handleCloseEdit"
    />
  </div>
</template>

<style scoped>
.bookmark-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.list-count {
  font-size: 13px;
  color: var(--text-muted);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-muted);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.bookmark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

@media (max-width: 640px) {
  .bookmark-grid {
    grid-template-columns: 1fr;
  }
}
</style>
