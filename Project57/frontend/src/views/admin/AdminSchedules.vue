<template>
  <div>
    <h2 class="mb-4">
      <i class="bi bi-calendar-event me-2"></i>场次管理
    </h2>

    <div class="card shadow mb-4">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">选择电影</label>
              <select class="form-select" v-model="form.movie" required>
                <option value="">请选择电影</option>
                <option v-for="movie in movies" :key="movie._id" :value="movie._id">
                  {{ movie.title }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">影厅名称</label>
              <input type="text" class="form-control" v-model="form.theater" required>
            </div>
            <div class="col-md-4">
              <label class="form-label">开始时间</label>
              <input type="datetime-local" class="form-control" v-model="form.startTime" required>
            </div>
            <div class="col-md-4">
              <label class="form-label">结束时间</label>
              <input type="datetime-local" class="form-control" v-model="form.endTime" required>
            </div>
            <div class="col-md-4">
              <label class="form-label">票价（元）</label>
              <input type="number" class="form-control" v-model.number="form.price" required>
            </div>
            <div class="col-md-3">
              <label class="form-label">座位行数</label>
              <input type="number" class="form-control" v-model.number="form.rows" required>
            </div>
            <div class="col-md-3">
              <label class="form-label">座位列数</label>
              <input type="number" class="form-control" v-model.number="form.cols" required>
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                添加场次
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="card shadow">
      <div class="card-body">
        <h5 class="card-title mb-3">场次列表</h5>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>电影</th>
                <th>影厅</th>
                <th>开始时间</th>
                <th>结束时间</th>
                <th>票价</th>
                <th>座位</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="schedule in schedules" :key="schedule._id">
                <td>{{ schedule.movie?.title }}</td>
                <td>{{ schedule.theater }}</td>
                <td>{{ formatDateTime(schedule.startTime) }}</td>
                <td>{{ formatDateTime(schedule.endTime) }}</td>
                <td class="text-danger fw-bold">¥{{ schedule.price }}</td>
                <td>{{ schedule.rows }} × {{ schedule.cols }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteSchedule(schedule._id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="schedules.length === 0">
                <td colspan="7" class="text-center text-muted py-4">暂无场次</td>
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
import { movieApi, scheduleApi } from '../../api'

const movies = ref([])
const schedules = ref([])
const loading = ref(false)

const form = ref({
  movie: '',
  theater: '',
  startTime: '',
  endTime: '',
  price: 0,
  rows: 8,
  cols: 12
})

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const loadMovies = async () => {
  try {
    const res = await movieApi.getAll()
    movies.value = res.data
  } catch (err) {
    console.error('加载电影失败:', err)
  }
}

const loadSchedules = async () => {
  try {
    const res = await scheduleApi.getAll()
    schedules.value = res.data
  } catch (err) {
    console.error('加载场次失败:', err)
  }
}

const deleteSchedule = async (id) => {
  if (!confirm('确定要删除这个场次吗？')) return
  
  try {
    await scheduleApi.delete(id)
    alert('删除成功')
    loadSchedules()
  } catch (err) {
    console.error('删除失败:', err)
    alert('删除失败')
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await scheduleApi.create(form.value)
    alert('添加成功')
    form.value = {
      movie: '',
      theater: '',
      startTime: '',
      endTime: '',
      price: 0,
      rows: 8,
      cols: 12
    }
    loadSchedules()
  } catch (err) {
    console.error('添加失败:', err)
    alert('添加失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMovies()
  loadSchedules()
})
</script>
