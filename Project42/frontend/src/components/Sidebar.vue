<template>
  <div class="sidebar">
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">分类</h5>
      </div>
      <div class="card-body">
        <ul class="list-unstyled mb-0">
          <li v-for="category in categories" :key="category.id">
            <router-link :to="`/category/${category.slug}`" class="text-decoration-none">
              {{ category.name }} ({{ category.article_count }})
            </router-link>
          </li>
          <li v-if="categories.length === 0" class="text-muted">暂无分类</li>
        </ul>
      </div>
    </div>
    
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">标签</h5>
      </div>
      <div class="card-body">
        <div class="d-flex flex-wrap gap-2">
          <router-link
            v-for="tag in tags"
            :key="tag.id"
            :to="`/tag/${tag.slug}`"
            class="badge bg-secondary text-decoration-none"
          >
            {{ tag.name }}
          </router-link>
          <span v-if="tags.length === 0" class="text-muted">暂无标签</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">最新文章</h5>
      </div>
      <div class="card-body">
        <ul class="list-unstyled mb-0">
          <li v-for="article in recentArticles" :key="article.id" class="mb-2">
            <router-link :to="`/article/${article.id}`" class="text-decoration-none">
              {{ article.title }}
            </router-link>
          </li>
          <li v-if="recentArticles.length === 0" class="text-muted">暂无文章</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoriesAPI, tagsAPI, articlesAPI } from '../api'

const categories = ref([])
const tags = ref([])
const recentArticles = ref([])

onMounted(async () => {
  try {
    const [catRes, tagRes, artRes] = await Promise.all([
      categoriesAPI.list(),
      tagsAPI.list(),
      articlesAPI.recent()
    ])
    categories.value = catRes.data
    tags.value = tagRes.data
    recentArticles.value = artRes.data
  } catch (error) {
    console.error('Failed to load sidebar data:', error)
  }
})
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 20px;
}
</style>
