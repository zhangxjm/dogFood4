<template>
  <div class="home">
    <div class="jumbotron mb-5 p-5 rounded bg-light">
      <h1 class="display-4">欢迎来到我的博客！</h1>
      <p class="lead">分享技术，记录生活，探索未知</p>
      <hr class="my-4">
      <p>这里是一个基于 Django + Vue.js 构建的个人博客系统</p>
      <router-link to="/articles" class="btn btn-primary btn-lg">浏览文章</router-link>
    </div>

    <div class="row">
      <div class="col-md-8">
        <h2 class="mb-4">最新文章</h2>
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
        <div v-if="articles.length === 0" class="text-center py-5">
          <p class="text-muted">暂无文章</p>
        </div>
      </div>
      <div class="col-md-4">
        <Sidebar />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { articlesAPI } from '../api'
import ArticleCard from '../components/ArticleCard.vue'
import Sidebar from '../components/Sidebar.vue'

const articles = ref([])

onMounted(async () => {
  try {
    const response = await articlesAPI.list({ page_size: 5 })
    articles.value = response.data.results || response.data
  } catch (error) {
    console.error('Failed to load articles:', error)
  }
})
</script>
