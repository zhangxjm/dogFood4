import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getProfile, register } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const refresh = ref(localStorage.getItem('refresh') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isLeader = computed(() => user.value?.role === 'leader')

  async function doLogin(username, password) {
    const res = await login({ username, password })
    token.value = res.access
    refresh.value = res.refresh
    localStorage.setItem('token', res.access)
    localStorage.setItem('refresh', res.refresh)
    await fetchProfile()
  }

  async function doRegister(data) {
    const res = await register(data)
    return res
  }

  async function fetchProfile() {
    const res = await getProfile()
    user.value = res
    localStorage.setItem('user', JSON.stringify(res))
  }

  function logout() {
    token.value = ''
    refresh.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
  }

  return {
    token,
    refresh,
    user,
    isLoggedIn,
    isLeader,
    doLogin,
    doRegister,
    fetchProfile,
    logout
  }
})
