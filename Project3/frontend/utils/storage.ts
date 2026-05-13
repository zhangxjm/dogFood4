export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
      return defaultValue
    }
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      return
    }
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('存储失败:', error)
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') {
      return
    }
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('删除失败:', error)
    }
  },

  clear(): void {
    if (typeof window === 'undefined') {
      return
    }
    try {
      localStorage.clear()
    } catch (error) {
      console.error('清空失败:', error)
    }
  }
}
