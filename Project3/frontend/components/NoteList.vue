<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-800">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="relative">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索笔记..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @input="handleSearch"
        />
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else-if="searchResults.length > 0 && searchQuery" class="p-2">
        <div
          v-for="note in searchResults"
          :key="note._id"
          @click="$emit('select', note)"
          class="p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex items-center gap-2 mb-1">
            <h4 class="font-medium text-gray-900 dark:text-white truncate">{{ note.title || '无标题' }}</h4>
            <svg v-if="note.isFavorite" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ stripHtml(note.content) || '空笔记' }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ formatDate(note.updatedAt) }}</p>
        </div>
      </div>
      
      <div v-else-if="notes.length > 0 && !searchQuery" class="p-2">
        <div
          v-for="note in notes"
          :key="note._id"
          @click="$emit('select', note)"
          class="p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex items-center gap-2 mb-1">
            <h4 class="font-medium text-gray-900 dark:text-white truncate">{{ note.title || '无标题' }}</h4>
            <svg v-if="note.isFavorite" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ stripHtml(note.content) || '空笔记' }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ formatDate(note.updatedAt) }}</p>
        </div>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
        <p class="mb-4">{{ searchQuery ? '未找到相关笔记' : '暂无笔记' }}</p>
        <button
          @click="$emit('create')"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          创建笔记
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/types'
import { formatDate, stripHtml } from '~/utils'

const props = defineProps<{
  notes: Note[]
  loading: boolean
}>()

defineEmits(['select', 'create'])

const { searchNotes } = useNotes()

const searchQuery = ref('')
const searchResults = ref<Note[]>([])
let searchTimer: any = null

const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      searchResults.value = await searchNotes(searchQuery.value)
    } else {
      searchResults.value = []
    }
  }, 300)
}
</script>
