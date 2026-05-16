<template>
  <div class="admin-categories">
    <h3 class="mb-4">分类管理</h3>
    
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">添加分类</h5>
        <div class="row">
          <div class="col-md-5">
            <input type="text" class="form-control" v-model="newCategory.name" placeholder="分类名称">
          </div>
          <div class="col-md-5">
            <input type="text" class="form-control" v-model="newCategory.description" placeholder="描述（可选）">
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" @click="addCategory">添加</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>描述</th>
            <th>文章数</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.id }}</td>
            <td>{{ category.name }}</td>
            <td>{{ category.description || '-' }}</td>
            <td>{{ category.article_count || 0 }}</td>
            <td>{{ formatDate(category.created_at) }}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger" @click="deleteCategory(category.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoriesAPI } from '../../api'

const categories = ref([])
const newCategory = ref({
  name: '',
  description: ''
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const loadCategories = async () => {
  try {
    const response = await categoriesAPI.list()
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const addCategory = async () => {
  if (!newCategory.value.name) {
    alert('请输入分类名称')
    return
  }
  
  try {
    await categoriesAPI.create(newCategory.value)
    newCategory.value = { name: '', description: '' }
    loadCategories()
  } catch (error) {
    console.error('Failed to add category:', error)
    alert('添加失败，请重试')
  }
}

const deleteCategory = async (id) => {
  if (confirm('确定要删除这个分类吗？')) {
    try {
      await categoriesAPI.delete(id)
      loadCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }
}

onMounted(() => {
  loadCategories()
})
</script>
