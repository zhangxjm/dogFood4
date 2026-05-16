<template>
  <div class="admin-tags">
    <h3 class="mb-4">标签管理</h3>
    
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">添加标签</h5>
        <div class="row">
          <div class="col-md-10">
            <input type="text" class="form-control" v-model="newTag.name" placeholder="标签名称">
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" @click="addTag">添加</button>
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
            <th>文章数</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tag in tags" :key="tag.id">
            <td>{{ tag.id }}</td>
            <td>{{ tag.name }}</td>
            <td>{{ tag.article_count || 0 }}</td>
            <td>{{ formatDate(tag.created_at) }}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger" @click="deleteTag(tag.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { tagsAPI } from '../../api'

const tags = ref([])
const newTag = ref({
  name: ''
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const loadTags = async () => {
  try {
    const response = await tagsAPI.list()
    tags.value = response.data
  } catch (error) {
    console.error('Failed to load tags:', error)
  }
}

const addTag = async () => {
  if (!newTag.value.name) {
    alert('请输入标签名称')
    return
  }
  
  try {
    await tagsAPI.create(newTag.value)
    newTag.value = { name: '' }
    loadTags()
  } catch (error) {
    console.error('Failed to add tag:', error)
    alert('添加失败，请重试')
  }
}

const deleteTag = async (id) => {
  if (confirm('确定要删除这个标签吗？')) {
    try {
      await tagsAPI.delete(id)
      loadTags()
    } catch (error) {
      console.error('Failed to delete tag:', error)
    }
  }
}

onMounted(() => {
  loadTags()
})
</script>
