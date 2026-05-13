import { create } from 'zustand'

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

const getStoredToken = () => {
  return localStorage.getItem('token')
}

export const useUserStore = create((set) => ({
  token: getStoredToken(),
  user: getStoredUser(),

  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),

  login: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },

  updateUser: (updates) => set((state) => {
    const newUser = { ...state.user, ...updates }
    localStorage.setItem('user', JSON.stringify(newUser))
    return { user: newUser }
  }),
}))

export const useAppStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}))
