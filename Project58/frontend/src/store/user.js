import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const login = async (username, password) => {
    const res = await request.post('/auth/login', { username, password })
    token.value = res.data.data.token
    user.value = res.data.data.user
    localStorage.setItem('token', res.data.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.data.user))
    return res.data
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const getUserInfo = async () => {
    const res = await request.get('/auth/userinfo')
    user.value = res.data.data
    localStorage.setItem('user', JSON.stringify(res.data.data))
    return res.data
  }

  return {
    token,
    user,
    login,
    logout,
    getUserInfo
  }
})
