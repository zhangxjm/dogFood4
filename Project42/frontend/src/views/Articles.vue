<template>
  <div class="articles">
    <div class="row">
      <div class="col-md-8">
        <h2 class="mb-4">
          {{ title }}
        </h2>
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
        <div v-if="articles.length === 0" class="text-center py-5">
          <p class="text-muted">暂无文章</p>
        </div>
        <nav v-if="totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)">上一页</button>
            </li>
            <li class="page-item" :class="{ active: i === currentPage }" v-for="i in totalPages" :key="i">
              <button class="page-link" @click="changePage(i)">{{ i }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="changePage(currentPage + 1)">下一页</button>
            </li>
          </ul>
        </nav>
      </div>
      <div class="col-md-4">
        <Sidebar />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { articlesAPI } from '../api'
import ArticleCard from '../components/ArticleCard.vue'
import Sidebar from '../components/Sidebar.vue'

const route = useRoute()

const articles = ref([])
const currentPage = ref(1)
const totalPages = ref(1)

const title = computed(() => {
  if (route.params.slug && route.name === 'CategoryArticles') {
    return `分类: ${route.params.slug}`
  }
  if (route.params.slug && route.name === 'TagArticles') {
    return `标签: ${route.params.slug}`
  }
  return '所有文章'
})

const loadArticles = async () => {
  try {
    const params = { page: currentPage.value, page_size: 10 }
    if (route.params.slug && route.name === 'CategoryArticles') {
      params.category = route.params.slug
    }
    if (route.params.slug && route.name === 'TagArticles') {
      params.tag = route.params.slug
    }
    const response = await articlesAPI.list(params)
    articles.value = response.data.results || response.data
    if (response.data.count) {
      totalPages.value = Math.ceil(response.data.count / 10)
    }
  } catch (error) {
    console.error('Failed to load articles:', error)
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadArticles()
  }
}

onMounted(() => {
  loadArticles()
})

watch(() => route.params, () => {
  currentPage.value = 1
  loadArticles()
})
</script>
