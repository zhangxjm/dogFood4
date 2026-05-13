<template>
  <div class="space-y-1">
    <template v-for="dir in directories" :key="dir._id">
      <div class="group">
        <div
          class="flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer"
          :class="{
            'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400': currentDirectoryId === dir._id,
            'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700': currentDirectoryId !== dir._id
          }"
          @click="selectDirectory(dir._id)"
        >
          <button
            @click.stop="toggleExpand(dir._id)"
            class="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition-transform"
              :class="{ 'rotate-90': expandedDirs.has(dir._id) }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          
          <span class="flex-1 truncate text-sm">{{ dir.name }}</span>
          
          <div class="hidden group-hover:flex items-center gap-1">
            <button
              @click.stop="handleAddChild(dir._id)"
              class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </button>
            <button
              @click.stop="handleRename(dir)"
              class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              @click.stop="handleDelete(dir._id)"
              class="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-500 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="expandedDirs.has(dir._id) && dir.children?.length" class="ml-4 mt-1">
          <DirectoryTree :directories="dir.children" />
        </div>
      </div>
    </template>
    
    <div
      v-if="showRenameDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showRenameDialog = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-80">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">重命名目录</h3>
        <input
          v-model="renameValue"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @keyup.enter="confirmRename"
        />
        <div class="flex justify-end gap-2 mt-4">
          <button
            @click="showRenameDialog = false"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            取消
          </button>
          <button
            @click="confirmRename"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            保存
          </button>
        </div>
      </div>
    </div>
    
    <div
      v-if="showNewChildDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showNewChildDialog = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-80">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">新建子目录</h3>
        <input
          v-model="newChildName"
          type="text"
          placeholder="目录名称"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @keyup.enter="confirmNewChild"
        />
        <div class="flex justify-end gap-2 mt-4">
          <button
            @click="showNewChildDialog = false"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            取消
          </button>
          <button
            @click="confirmNewChild"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DirectoryTree as DirectoryTreeType } from '~/types'

const props = defineProps<{
  directories: DirectoryTreeType[]
}>()

const { currentDirectoryId, setCurrentDirectoryId, createDirectory, updateDirectory, deleteDirectory, fetchDirectories } = useDirectories()

const expandedDirs = ref(new Set<string>())
const showRenameDialog = ref(false)
const showNewChildDialog = ref(false)
const renameDirId = ref<string | null>(null)
const newChildParentId = ref<string | null>(null)
const renameValue = ref('')
const newChildName = ref('')

const toggleExpand = (id: string) => {
  if (expandedDirs.value.has(id)) {
    expandedDirs.value.delete(id)
  } else {
    expandedDirs.value.add(id)
  }
}

const selectDirectory = (id: string) => {
  setCurrentDirectoryId(id)
  if (!expandedDirs.value.has(id)) {
    expandedDirs.value.add(id)
  }
}

const handleAddChild = (parentId: string) => {
  newChildParentId.value = parentId
  newChildName.value = ''
  showNewChildDialog.value = true
}

const confirmNewChild = async () => {
  if (!newChildName.value.trim() || !newChildParentId.value) return
  
  await createDirectory(newChildName.value.trim(), newChildParentId.value)
  await fetchDirectories()
  if (!expandedDirs.value.has(newChildParentId.value)) {
    expandedDirs.value.add(newChildParentId.value)
  }
  showNewChildDialog.value = false
  newChildName.value = ''
  newChildParentId.value = null
}

const handleRename = (dir: DirectoryTreeType) => {
  renameDirId.value = dir._id
  renameValue.value = dir.name
  showRenameDialog.value = true
}

const confirmRename = async () => {
  if (!renameValue.value.trim() || !renameDirId.value) return
  
  await updateDirectory(renameDirId.value, { name: renameValue.value.trim() })
  await fetchDirectories()
  showRenameDialog.value = false
  renameValue.value = ''
  renameDirId.value = null
}

const handleDelete = async (id: string) => {
  if (confirm('确定要删除此目录及其所有子目录吗？')) {
    await deleteDirectory(id)
    await fetchDirectories()
  }
}
</script>
