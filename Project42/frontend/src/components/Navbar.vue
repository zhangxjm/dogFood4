<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link class="navbar-brand" to="/">个人博客</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">首页</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/articles">文章</router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <router-link class="nav-link" to="/admin">管理后台</router-link>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <form class="d-flex" @submit.prevent="handleSearch">
              <input class="form-control me-2" type="search" v-model="searchQuery" placeholder="搜索...">
              <button class="btn btn-outline-primary" type="submit">搜索</button>
            </form>
          </li>
          <li class="nav-item ms-2" v-if="!isAuthenticated">
            <router-link class="btn btn-primary" to="/login">登录</router-link>
          </li>
          <li class="nav-item ms-2" v-else>
            <button class="btn btn-outline-danger" @click="logout">退出</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const isAuthenticated = computed(() => authStore.isAuthenticated)

const logout = () => {
  authStore.logout()
  router.push('/')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    searchQuery.value = ''
  }
}
</script>
