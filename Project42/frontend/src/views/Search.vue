<template>
  <div class="search">
    <div class="row">
      <div class="col-md-8">
        <h2 class="mb-4">搜索结果: {{ searchQuery }}</h2>
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
        <div v-if="articles.length === 0 && !loading" class="text-center py-5">
          <p class="text-muted">没有找到相关文章</p>
        </div>
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">搜索中...</span>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <Sidebar />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { articlesAPI } from '../api'
import ArticleCard from '../components/ArticleCard.vue'
import Sidebar from '../components/Sidebar.vue'

const route = useRoute()

const articles = ref([])
const loading = ref(false)
const searchQuery = ref('')

const search = async () => {
  const q = route.query.q || ''
  searchQuery.value = q
  if (!q) return
  
  loading.value = true
  try {
    const response = await articlesAPI.list({ search: q })
    articles.value = response.data.results || response.data
  } catch (error) {
    console.error('Failed to search articles:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  search()
})

watch(() => route.query, () => {
  search()
})
</script>
