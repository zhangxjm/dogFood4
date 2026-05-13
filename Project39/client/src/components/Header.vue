<script setup lang="ts">
import { ref } from 'vue';
import { useBookmarkStore } from '../stores/bookmark';

const bookmarkStore = useBookmarkStore();
const searchKeyword = ref('');

function handleSearch() {
  bookmarkStore.searchBookmarks({
    ...bookmarkStore.searchParams,
    keyword: searchKeyword.value || undefined,
  });
}

function clearSearch() {
  searchKeyword.value = '';
  bookmarkStore.searchBookmarks({
    ...bookmarkStore.searchParams,
    keyword: undefined,
  });
}
</script>

<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <span class="logo-icon">📌</span>
        <span class="logo-text">我的书签</span>
      </div>
      
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="搜索书签..."
          @keyup.enter="handleSearch"
        />
        <button v-if="searchKeyword" class="search-clear" @click="clearSearch">
          ✕
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.search-bar {
  flex: 1;
  max-width: 400px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 36px;
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 14px;
  background: var(--bg-primary);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  background: var(--bg-secondary);
  border-color: var(--primary);
}

.search-clear {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 14px;
  padding: 2px 6px;
}

.search-clear:hover {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px;
    gap: 12px;
  }
  
  .logo-text {
    display: none;
  }
  
  .search-bar {
    flex: 1;
    max-width: none;
  }
}
</style>
