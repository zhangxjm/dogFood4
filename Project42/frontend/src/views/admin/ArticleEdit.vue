<template>
  <div class="article-edit">
    <h3 class="mb-4">{{ isEdit ? '编辑文章' : '新建文章' }}</h3>
    
    <form @submit.prevent="submitForm">
      <div class="mb-3">
        <label for="title" class="form-label">标题</label>
        <input type="text" class="form-control" id="title" v-model="form.title" required>
      </div>
      
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="category" class="form-label">分类</label>
          <select class="form-select" id="category" v-model="form.category">
            <option value="">请选择分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label for="status" class="form-label">状态</label>
          <select class="form-select" id="status" v-model="form.status">
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
        </div>
      </div>
      
      <div class="mb-3">
        <label class="form-label">标签</label>
        <div class="d-flex flex-wrap gap-2">
          <div v-for="tag in tags" :key="tag.id" class="form-check">
            <input class="form-check-input" type="checkbox" :id="'tag-' + tag.id" :value="tag.id" v-model="form.tags">
            <label class="form-check-label" :for="'tag-' + tag.id">{{ tag.name }}</label>
          </div>
        </div>
      </div>
      
      <div class="mb-3">
        <label for="excerpt" class="form-label">摘要</label>
        <textarea class="form-control" id="excerpt" v-model="form.excerpt" rows="2"></textarea>
      </div>
      
      <div class="mb-3">
        <label class="form-label">内容</label>
        <textarea class="form-control" v-model="form.content" rows="15" placeholder="支持Markdown格式"></textarea>
      </div>
      
      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '保存中...' : '保存' }}
        </button>
        <router-link to="/admin/articles" class="btn btn-outline-secondary">取消</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articlesAPI, categoriesAPI, tagsAPI } from '../../api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const categories = ref([])
const tags = ref([])

const form = ref({
  title: '',
  category: '',
  tags: [],
  excerpt: '',
  content: '',
  status: 'draft'
})

const loadArticle = async (id) => {
  try {
    const response = await articlesAPI.get(id)
    const article = response.data
    form.value = {
      title: article.title,
      category: article.category?.id || '',
      tags: article.tags?.map(t => t.id) || [],
      excerpt: article.excerpt || '',
      content: article.content || '',
      status: article.status || 'draft'
    }
  } catch (error) {
    console.error('Failed to load article:', error)
  }
}

const loadCategories = async () => {
  try {
    const response = await categoriesAPI.list()
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const loadTags = async () => {
  try {
    const response = await tagsAPI.list()
    tags.value = response.data
  } catch (error) {
    console.error('Failed to load tags:', error)
  }
}

const submitForm = async () => {
  if (!form.value.title || !form.value.content) {
    alert('请填写标题和内容')
    return
  }

  loading.value = true
  try {
    const data = {
      title: form.value.title,
      category: form.value.category || null,
      tags: form.value.tags,
      excerpt: form.value.excerpt,
      content: form.value.content,
      status: form.value.status
    }

    if (isEdit.value) {
      await articlesAPI.update(route.params.id, data)
    } else {
      await articlesAPI.create(data)
    }

    router.push('/admin/articles')
  } catch (error) {
    console.error('Failed to save article:', error)
    alert('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadTags()
  if (isEdit.value) {
    loadArticle(route.params.id)
  }
})
</script>
