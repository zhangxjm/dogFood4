<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-800">
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <button
          @click="$emit('close')"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <div class="flex items-center gap-2">
          <span v-if="saving" class="text-sm text-gray-500">保存中...</span>
          <span v-else-if="lastSaved" class="text-sm text-green-500">已保存</span>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <button
          @click="toggleFavorite"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="note?.isFavorite ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-300'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
        <button
          @click="handleDelete"
          class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto p-6">
      <input
        v-model="title"
        type="text"
        placeholder="无标题笔记"
        class="w-full text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none mb-4 placeholder-gray-400"
      />
      
      <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        最后编辑于 {{ note ? formatDate(note.updatedAt) : '刚刚' }}
      </div>
      
      <div class="editor-wrapper">
        <ClientOnly>
          <QuillEditor
            ref="editorRef"
            v-model:content="content"
            contentType="html"
            :options="editorOptions"
            class="min-h-[400px] dark:bg-gray-700"
            @update:content="handleContentChange"
          />
          <template #fallback>
            <div class="min-h-[400px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span class="text-gray-500 dark:text-gray-400">加载编辑器中...</span>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/types'
import { formatDate } from '~/utils'
import { QuillEditor } from '@vueup/vue-quill'

const props = defineProps<{
  noteId: string
}>()

defineEmits(['close'])

const { fetchNote, updateNote, deleteNote, fetchNotes, syncWithServer } = useNotes()

const note = ref<Note | null>(null)
const title = ref('')
const content = ref('')
const saving = ref(false)
const lastSaved = ref(false)
const editorRef = ref()

let saveTimer: any = null

const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ]
  }
}

const loadNote = async () => {
  if (!props.noteId) return
  
  const data = await fetchNote(props.noteId)
  if (data) {
    note.value = data
    title.value = data.title
    content.value = data.content
  }
}

const handleContentChange = () => {
  lastSaved.value = false
  queueSave()
}

const queueSave = () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    await saveNote()
  }, 1000)
}

const saveNote = async () => {
  if (!props.noteId) return
  
  saving.value = true
  try {
    await updateNote(props.noteId, {
      title: title.value || '无标题笔记',
      content: content.value
    })
    lastSaved.value = true
    setTimeout(() => {
      lastSaved.value = false
    }, 2000)
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const toggleFavorite = async () => {
  if (!note.value) return
  
  await updateNote(props.noteId, {
    isFavorite: !note.value.isFavorite
  })
  if (note.value) {
    note.value.isFavorite = !note.value.isFavorite
  }
}

const handleDelete = async () => {
  if (typeof window !== 'undefined' && confirm('确定要删除此笔记吗？')) {
    await deleteNote(props.noteId)
    await fetchNotes()
    await syncWithServer()
  }
}

watch(() => props.noteId, () => {
  loadNote()
})

onMounted(() => {
  loadNote()
})

onBeforeUnmount(() => {
  clearTimeout(saveTimer)
})
</script>

<style scoped>
.editor-wrapper :deep(.ql-toolbar) {
  @apply bg-gray-50 dark:bg-gray-600 border-gray-200 dark:border-gray-500 rounded-t-lg;
}

.editor-wrapper :deep(.ql-container) {
  @apply bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-500 rounded-b-lg min-h-[400px];
}

.editor-wrapper :deep(.ql-editor) {
  @apply text-gray-900 dark:text-white text-base;
}

.editor-wrapper :deep(.ql-editor.ql-blank::before) {
  @apply text-gray-400 dark:text-gray-500;
}
</style>
