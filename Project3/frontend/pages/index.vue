<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar
      class="w-64 flex-shrink-0"
      @create-note="handleCreateNote"
      @select-all="handleSelectAll"
      @select-favorites="handleSelectFavorites"
    />
    
    <div class="flex-1 flex overflow-hidden">
      <NoteList
        v-if="!currentNoteId"
        class="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700"
        :notes="filteredNotes"
        :loading="notesLoading"
        @select="handleSelectNote"
        @create="handleCreateNote"
      />
      
      <NoteEditor
        v-if="currentNoteId"
        class="flex-1"
        :note-id="currentNoteId"
        @close="handleCloseNote"
      />
      
      <EmptyState
        v-else
        class="flex-1 flex items-center justify-center"
        @create="handleCreateNote"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/types'

const route = useRoute()
const router = useRouter()

const { notes, loading: notesLoading, fetchNotes, createNote, syncWithServer } = useNotes()
const { currentDirectoryId } = useDirectories()

const showFavorites = ref(false)
const currentNoteId = computed(() => route.query.id as string || null)

const filteredNotes = computed(() => {
  if (showFavorites.value) {
    return notes.value.filter(n => n.isFavorite)
  }
  return notes.value
})

const handleSelectAll = () => {
  showFavorites.value = false
  currentDirectoryId.value = null
  fetchNotes(null)
}

const handleSelectFavorites = () => {
  showFavorites.value = true
  fetchNotes(undefined, true)
}

const handleCreateNote = async () => {
  const newNote = await createNote({
    title: '无标题笔记',
    content: '',
    directoryId: currentDirectoryId.value,
    tags: []
  })
  if (newNote) {
    router.push({ query: { id: newNote._id } })
  }
}

const handleSelectNote = (note: Note) => {
  router.push({ query: { id: note._id } })
}

const handleCloseNote = () => {
  router.push({ query: {} })
}

onMounted(async () => {
  await fetchNotes()
  await syncWithServer()
  setInterval(() => {
    syncWithServer()
  }, 30000)
})

watch(currentDirectoryId, (newVal) => {
  if (!showFavorites.value) {
    fetchNotes(newVal)
  }
})
</script>
