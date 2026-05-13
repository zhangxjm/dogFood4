import type { Directory } from '~/types'
import { buildDirectoryTree } from '~/utils'
import { api } from '~/utils/api'

const isClient = typeof window !== 'undefined'

export const useDirectories = () => {
  const directories = useState<Directory[]>('directories', () => [])
  const currentDirectoryId = useState<string | null>('currentDirectoryId', () => null)
  const loading = useState('directoriesLoading', () => false)

  const fetchDirectories = async () => {
    if (!isClient) return
    loading.value = true
    try {
      const data = await api.get<Directory[]>('/directories')
      directories.value = data
    } catch (error) {
      console.error('获取目录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const createDirectory = async (name: string, parentId?: string | null): Promise<Directory | null> => {
    if (!isClient) return null
    try {
      const data = await api.post<Directory>('/directories', { name, parentId: parentId || null })
      if (data) {
        directories.value = [...directories.value, data]
      }
      return data
    } catch (error) {
      console.error('创建目录失败:', error)
      return null
    }
  }

  const updateDirectory = async (id: string, data: Partial<Directory>): Promise<Directory | null> => {
    if (!isClient) return null
    try {
      const updated = await api.put<Directory>(`/directories/${id}`, data)
      if (updated) {
        const index = directories.value.findIndex(d => d._id === id)
        if (index !== -1) {
          directories.value[index] = updated
        }
      }
      return updated
    } catch (error) {
      console.error('更新目录失败:', error)
      return null
    }
  }

  const deleteDirectory = async (id: string): Promise<boolean> => {
    if (!isClient) return false
    try {
      await api.delete(`/directories/${id}`)
      directories.value = directories.value.filter(d => d._id !== id)
      if (currentDirectoryId.value === id) {
        currentDirectoryId.value = null
      }
      return true
    } catch (error) {
      console.error('删除目录失败:', error)
      return false
    }
  }

  const directoryTree = computed(() => buildDirectoryTree(directories.value))

  const getDirectoryPath = (id: string | null): string[] => {
    const path: string[] = []
    let currentId = id
    
    while (currentId) {
      const dir = directories.value.find(d => d._id === currentId)
      if (dir) {
        path.unshift(dir.name)
        currentId = dir.parentId
      } else {
        break
      }
    }
    
    return path
  }

  const setCurrentDirectoryId = (id: string | null) => {
    currentDirectoryId.value = id
  }

  return {
    directories,
    currentDirectoryId,
    loading,
    directoryTree,
    fetchDirectories,
    createDirectory,
    updateDirectory,
    deleteDirectory,
    getDirectoryPath,
    setCurrentDirectoryId
  }
}
