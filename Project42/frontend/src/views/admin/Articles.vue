<template>
  <div class="admin-articles">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>文章管理</h3>
      <router-link to="/admin/article/new" class="btn btn-primary">新建文章</router-link>
    </div>
    
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>分类</th>
            <th>状态</th>
            <th>浏览量</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>{{ article.id }}</td>
            <td>{{ article.title }}</td>
            <td>{{ article.category?.name || '-' }}</td>
            <td>
              <span class="badge" :class="article.status === 'published' ? 'bg-success' : 'bg-secondary'">
                {{ article.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ article.views }}</td>
            <td>{{ formatDate(article.created_at) }}</td>
            <td>
              <router-link :to="`/admin/article/${article.id}/edit`" class="btn btn-sm btn-outline-primary me-1">编辑</router-link>
              <button class="btn btn-sm btn-outline-danger" @click="deleteArticle(article.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="articles.length === 0" class="text-center py-5">
      <p class="text-muted">暂无文章</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { articlesAPI } from '../../api'

const articles = ref([])

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const loadArticles = async () => {
  try {
    const response = await articlesAPI.list({ page_size: 100 })
    articles.value = response.data.results || response.data
  } catch (error) {
    console.error('Failed to load articles:', error)
  }
}

const deleteArticle = async (id) => {
  if (confirm('确定要删除这篇文章吗？')) {
    try {
      await articlesAPI.delete(id)
      loadArticles()
    } catch (error) {
      console.error('Failed to delete article:', error)
    }
  }
}

onMounted(() => {
  loadArticles()
})
</script>
