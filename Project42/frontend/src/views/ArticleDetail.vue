<template>
  <div class="article-detail">
    <div class="row">
      <div class="col-md-8">
        <div v-if="article" class="article-content">
          <h1 class="mb-3">{{ article.title }}</h1>
          <div class="meta mb-4 text-muted">
            <span>发布于 {{ formatDate(article.created_at) }}</span>
            <span class="ms-3">👁️ {{ article.views }} 阅读</span>
            <span v-if="article.category" class="ms-3">
              分类: <router-link :to="`/category/${article.category.slug}`">{{ article.category.name }}</router-link>
            </span>
          </div>
          <div class="tags mb-4">
            <span v-for="tag in article.tags" :key="tag.id" class="badge bg-secondary me-2">
              <router-link :to="`/tag/${tag.slug}`" class="text-white text-decoration-none">{{ tag.name }}</router-link>
            </span>
          </div>
          <div v-if="article.cover_image" class="mb-4">
            <img :src="article.cover_image" class="img-fluid rounded" :alt="article.title">
          </div>
          <div class="content-html" v-html="article.content_html"></div>
          
          <hr class="my-5">
          
          <h3 class="mb-4">评论 ({{ comments.length }})</h3>
          
          <div class="card mb-4 comment-form">
            <div class="card-body">
              <h5 class="card-title">发表评论</h5>
              <div class="mb-3">
                <input type="text" class="form-control" v-model="newComment.author_name" placeholder="昵称" required>
              </div>
              <div class="mb-3">
                <input type="email" class="form-control" v-model="newComment.author_email" placeholder="邮箱" required>
              </div>
              <div class="mb-3">
                <textarea class="form-control" v-model="newComment.content" rows="3" placeholder="评论内容" required></textarea>
              </div>
              <button class="btn btn-primary" @click="submitComment" :disabled="submitting">
                {{ submitting ? '提交中...' : '提交评论' }}
              </button>
            </div>
          </div>

          <div v-if="comments.length === 0" class="text-center py-4">
            <p class="text-muted">暂无评论</p>
          </div>
          <div v-else>
            <div v-for="comment in comments" :key="comment.id" class="card mb-3">
              <div class="card-body">
                <h6 class="card-title">{{ comment.author_name }}</h6>
                <p class="card-text">{{ comment.content }}</p>
                <p class="card-text"><small class="text-muted">{{ formatDate(comment.created_at) }}</small></p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">加载中...</span>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { articlesAPI, commentsAPI } from '../api'
import Sidebar from '../components/Sidebar.vue'

const route = useRoute()

const article = ref(null)
const comments = ref([])
const submitting = ref(false)
const newComment = ref({
  author_name: '',
  author_email: '',
  content: ''
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const loadArticle = async () => {
  try {
    const response = await articlesAPI.get(route.params.id)
    article.value = response.data
    loadComments()
  } catch (error) {
    console.error('Failed to load article:', error)
  }
}

const loadComments = async () => {
  try {
    const response = await commentsAPI.list({ article: route.params.id })
    comments.value = response.data.results || response.data
  } catch (error) {
    console.error('Failed to load comments:', error)
  }
}

const submitComment = async () => {
  if (!newComment.value.author_name || !newComment.value.author_email || !newComment.value.content) {
    alert('请填写所有字段')
    return
  }
  
  submitting.value = true
  try {
    await commentsAPI.create({
      ...newComment.value,
      article: route.params.id
    })
    newComment.value = { author_name: '', author_email: '', content: '' }
    alert('评论提交成功，等待审核！')
  } catch (error) {
    console.error('Failed to submit comment:', error)
    alert('评论提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadArticle()
})
</script>

<style scoped>
.content-html {
  line-height: 1.8;
}

.content-html :deep(img) {
  max-width: 100%;
  height: auto;
}

.content-html :deep(pre) {
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  background-color: #f8f9fa;
}

.content-html :deep(code) {
  font-family: 'Courier New', monospace;
}

.comment-form {
  border: 1px solid #dee2e6;
}
</style>
