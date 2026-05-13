import type { Note } from '~/types'
import { storage } from '~/utils/storage'
import { api } from '~/utils/api'

const isClient = typeof window !== 'undefined'

export const useNotes = () => {
  const notes = useState<Note[]>('notes', () => [])
  const currentNote = useState<Note | null>('currentNote', () => null)
  const loading = useState('notesLoading', () => false)
  const lastSyncTime = useState<string | null>('lastSyncTime', () => storage.get('lastSyncTime', null))

  const fetchNotes = async (directoryId?: string | null, favorite?: boolean) => {
    if (!isClient) return
    loading.value = true
    try {
      let url = '/notes'
      const params: string[] = []
      if (directoryId !== undefined) {
        params.push(`directoryId=${directoryId || 'null'}`)
      }
      if (favorite) {
        params.push('favorite=true')
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`
      }
      const data = await api.get<Note[]>(url)
      notes.value = data
    } catch (error) {
      console.error('获取笔记失败:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchNote = async (id: string) => {
    if (!isClient) return null
    try {
      const data = await api.get<Note>(`/notes/${id}`)
      currentNote.value = data
      return data
    } catch (error) {
      console.error('获取笔记详情失败:', error)
      return null
    }
  }

  const createNote = async (noteData: Partial<Note>): Promise<Note | null> => {
    if (!isClient) return null
    try {
      const data = await api.post<Note>('/notes', noteData)
      if (data) {
        notes.value = [data, ...notes.value]
        await syncWithServer()
      }
      return data
    } catch (error) {
      console.error('创建笔记失败:', error)
      return null
    }
  }

  const updateNote = async (id: string, data: Partial<Note>): Promise<Note | null> => {
    if (!isClient) return null
    try {
      const updated = await api.put<Note>(`/notes/${id}`, data)
      if (updated) {
        const index = notes.value.findIndex(n => n._id === id)
        if (index !== -1) {
          notes.value[index] = updated
        }
        if (currentNote.value?._id === id) {
          currentNote.value = updated
        }
      }
      return updated
    } catch (error) {
      console.error('更新笔记失败:', error)
      return null
    }
  }

  const deleteNote = async (id: string): Promise<boolean> => {
    if (!isClient) return false
    try {
      await api.delete(`/notes/${id}`)
      notes.value = notes.value.filter(n => n._id !== id)
      if (currentNote.value?._id === id) {
        currentNote.value = null
      }
      return true
    } catch (error) {
      console.error('删除笔记失败:', error)
      return false
    }
  }

  const searchNotes = async (query: string): Promise<Note[]> => {
    if (!isClient || !query.trim()) return []
    try {
      const data = await api.get<Note[]>(`/notes/search?q=${encodeURIComponent(query)}`)
      return data
    } catch (error) {
      console.error('搜索失败:', error)
      return []
    }
  }

  const syncWithServer = async () => {
    if (!isClient) return
    try {
      const localNotes = storage.get<Note[]>('localNotes', [])
      const data = await api.post<any>('/notes/sync', {
        notes: localNotes,
        timestamp: lastSyncTime.value
      })
      
      if (data.serverNotes && data.serverNotes.length > 0) {
        const merged = [...notes.value]
        data.serverNotes.forEach((serverNote: Note) => {
          const index = merged.findIndex(n => n._id === serverNote._id)
          if (index === -1) {
            merged.push(serverNote)
          } else if (new Date(serverNote.updatedAt) > new Date(merged[index].updatedAt)) {
            merged[index] = serverNote
          }
        })
        notes.value = merged.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      }
      
      lastSyncTime.value = data.timestamp
      storage.set('lastSyncTime', data.timestamp)
    } catch (error) {
      console.error('同步失败:', error)
    }
  }

  const setCurrentNote = (note: Note | null) => {
    currentNote.value = note
  }

  return {
    notes,
    currentNote,
    loading,
    lastSyncTime,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    syncWithServer,
    setCurrentNote
  }
}
