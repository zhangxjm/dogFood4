import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'ADMIN')

  async function login(username, password) {
    const response = await api.post('/api/auth/login', { username, password })
    token.value = response.data.token
    userInfo.value = response.data.user
    localStorage.setItem('token', token.value)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    return response.data
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    delete api.defaults.headers.common['Authorization']
  }

  async function fetchCurrentUser() {
    try {
      if (token.value) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
        const response = await api.get('/api/auth/me')
        userInfo.value = response.data
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      }
    } catch (error) {
      logout()
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    fetchCurrentUser
  }
})
