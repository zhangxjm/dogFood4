<template>
  <div class="text-center">
    <div class="w-24 h-24 mx-auto mb-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
    </div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">开始记录你的想法</h2>
    <p class="text-gray-500 dark:text-gray-400 mb-6">创建你的第一篇笔记，随时随地记录灵感</p>
    <button
      @click="$emit('create')"
      class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      新建笔记
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits(['create'])
</script>
