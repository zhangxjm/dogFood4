<script setup lang="ts">
import { ref } from 'vue';
import { useBookmarkStore } from '../stores/bookmark';
import type { Bookmark } from '../types';

const props = defineProps<{
  bookmark: Bookmark;
  faviconUrl: string;
  formatDate: (date: string) => string;
}>();

const emit = defineEmits<{
  (e: 'edit', bookmark: Bookmark): void;
}>();

const bookmarkStore = useBookmarkStore();
const showMenu = ref(false);
const deleting = ref(false);

function openUrl() {
  window.open(props.bookmark.url, '_blank', 'noopener,noreferrer');
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getCategoryName(): string {
  if (!props.bookmark.categoryId) return '';
  if (typeof props.bookmark.categoryId === 'string') return '';
  return props.bookmark.categoryId.name;
}

function getCategoryColor(): string {
  if (!props.bookmark.categoryId) return '#9ca3af';
  if (typeof props.bookmark.categoryId === 'string') return '#9ca3af';
  return props.bookmark.categoryId.color;
}

async function handleToggleFavorite(e: Event) {
  e.stopPropagation();
  await bookmarkStore.toggleFavorite(props.bookmark._id);
}

async function handleDelete(e: Event) {
  e.stopPropagation();
  if (!confirm('确定要删除这个书签吗？')) return;
  
  try {
    deleting.value = true;
    await bookmarkStore.deleteBookmark(props.bookmark._id);
  } finally {
    deleting.value = false;
    showMenu.value = false;
  }
}

function handleEdit(e: Event) {
  e.stopPropagation();
  showMenu.value = false;
  emit('edit', props.bookmark);
}
</script>

<template>
  <article class="bookmark-card" @click="openUrl">
    <div class="card-header">
      <div class="favicon">
        <img v-if="faviconUrl" :src="faviconUrl" alt="" @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" />
        <span v-else>🌐</span>
      </div>
      
      <div class="card-title-wrap">
        <h3 class="card-title">{{ bookmark.title }}</h3>
        <p class="card-url">{{ getHostname(bookmark.url) }}</p>
      </div>
      
      <div class="card-actions" @click.stop>
        <button
          class="action-btn favorite-btn"
          :class="{ active: bookmark.isFavorite }"
          @click="handleToggleFavorite"
          :title="bookmark.isFavorite ? '取消收藏' : '添加收藏'"
        >
          {{ bookmark.isFavorite ? '⭐' : '☆' }}
        </button>
        
        <div class="menu-wrapper">
          <button class="action-btn menu-btn" @click="showMenu = !showMenu">
            ⋮
          </button>
          
          <div v-if="showMenu" class="dropdown-menu">
            <button class="menu-item" @click="handleEdit">
              ✏️ 编辑
            </button>
            <button class="menu-item danger" :disabled="deleting" @click="handleDelete">
              🗑️ 删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <p v-if="bookmark.description" class="card-description">
      {{ bookmark.description }}
    </p>
    
    <div class="card-footer">
      <span v-if="getCategoryName()" class="badge category-badge" :style="{ backgroundColor: getCategoryColor() + '20', color: getCategoryColor() }">
        {{ getCategoryName() }}
      </span>
      <div class="tags">
        <span v-for="tag in bookmark.tags" :key="tag" class="badge tag-badge">
          #{{ tag }}
        </span>
      </div>
      <span class="card-date">{{ formatDate(bookmark.createdAt) }}</span>
    </div>
  </article>
</template>

<style scoped>
.bookmark-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bookmark-card:hover {
  border-color: var(--text-muted);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.favicon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  overflow: hidden;
}

.favicon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.card-title-wrap {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-url {
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.action-btn:hover {
  background: var(--bg-primary);
}

.favorite-btn.active {
  color: var(--warning);
}

.menu-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 10;
  padding: 4px;
}

.menu-item {
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.menu-item:hover {
  background: var(--bg-primary);
}

.menu-item.danger {
  color: var(--danger);
}

.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-description {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
}

.category-badge {
  font-weight: 500;
}

.tags {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.tag-badge {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.card-date {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
