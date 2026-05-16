<template>
  <div>
    <h2 class="mb-4">
      <i class="bi bi-film me-2"></i>电影管理
    </h2>

    <div class="card shadow mb-4">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">电影名称</label>
              <input type="text" class="form-control" v-model="form.title" required>
            </div>
            <div class="col-md-3">
              <label class="form-label">类型</label>
              <input type="text" class="form-control" v-model="form.genre" required>
            </div>
            <div class="col-md-3">
              <label class="form-label">时长（分钟）</label>
              <input type="number" class="form-control" v-model.number="form.duration" required>
            </div>
            <div class="col-md-6">
              <label class="form-label">上映日期</label>
              <input type="date" class="form-control" v-model="form.releaseDate" required>
            </div>
            <div class="col-md-6">
              <label class="form-label">海报URL（可选）</label>
              <input type="text" class="form-control" v-model="form.poster">
            </div>
            <div class="col-12">
              <label class="form-label">电影描述</label>
              <textarea class="form-control" v-model="form.description" rows="3" required></textarea>
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingId ? '保存修改' : '添加电影' }}
              </button>
              <button v-if="editingId" type="button" class="btn btn-secondary ms-2" @click="resetForm">
                取消编辑
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="card shadow">
      <div class="card-body">
        <h5 class="card-title mb-3">电影列表</h5>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>电影名称</th>
                <th>类型</th>
                <th>时长</th>
                <th>上映日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="movie in movies" :key="movie._id">
                <td>{{ movie.title }}</td>
                <td><span class="badge bg-secondary">{{ movie.genre }}</span></td>
                <td>{{ movie.duration }}分钟</td>
                <td>{{ formatDate(movie.releaseDate) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editMovie(movie)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteMovie(movie._id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="movies.length === 0">
                <td colspan="5" class="text-center text-muted py-4">暂无电影</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { movieApi } from '../../api'

const movies = ref([])
const loading = ref(false)
const editingId = ref(null)

const form = ref({
  title: '',
  description: '',
  poster: '',
  duration: 0,
  genre: '',
  releaseDate: ''
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    poster: '',
    duration: 0,
    genre: '',
    releaseDate: ''
  }
  editingId.value = null
}

const loadMovies = async () => {
  try {
    const res = await movieApi.getAll()
    movies.value = res.data
  } catch (err) {
    console.error('加载电影失败:', err)
  }
}

const editMovie = (movie) => {
  editingId.value = movie._id
  form.value = {
    title: movie.title,
    description: movie.description,
    poster: movie.poster,
    duration: movie.duration,
    genre: movie.genre,
    releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0]
  }
}

const deleteMovie = async (id) => {
  if (!confirm('确定要删除这部电影吗？')) return
  
  try {
    await movieApi.delete(id)
    alert('删除成功')
    loadMovies()
  } catch (err) {
    console.error('删除失败:', err)
    alert('删除失败')
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (editingId.value) {
      await movieApi.update(editingId.value, form.value)
      alert('修改成功')
    } else {
      await movieApi.create(form.value)
      alert('添加成功')
    }
    resetForm()
    loadMovies()
  } catch (err) {
    console.error('提交失败:', err)
    alert('提交失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMovies()
})
</script>
