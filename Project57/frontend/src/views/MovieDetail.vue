<template>
  <div v-if="movie">
    <button class="btn btn-outline-secondary mb-4" @click="$router.back()">
      <i class="bi bi-arrow-left me-2"></i>返回
    </button>
    
    <div class="card shadow">
      <div class="row g-0">
        <div class="col-md-4 bg-secondary d-flex align-items-center justify-content-center">
          <i class="bi bi-film text-white display-1 p-5"></i>
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h2 class="card-title">{{ movie.title }}</h2>
            <div class="mb-3 text-muted">
              <span class="me-3"><i class="bi bi-tag me-1"></i>{{ movie.genre }}</span>
              <span class="me-3"><i class="bi bi-clock me-1"></i>{{ movie.duration }}分钟</span>
              <span><i class="bi bi-calendar me-1"></i>{{ formatDate(movie.releaseDate) }}</span>
            </div>
            <p class="card-text">{{ movie.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <h3 class="mb-4">
        <i class="bi bi-calendar-check me-2"></i>选择场次
      </h3>
      <div v-if="schedules.length > 0" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        <div class="col" v-for="schedule in schedules" :key="schedule._id">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title text-primary">
                <i class="bi bi-clock me-2"></i>{{ formatTime(schedule.startTime) }}
              </h5>
              <p class="card-text mb-2">
                <i class="bi bi-geo-alt me-2"></i>{{ schedule.theater }}
              </p>
              <p class="card-text mb-3">
                <span class="badge bg-success fs-6">¥{{ schedule.price }}</span>
              </p>
            </div>
            <div class="card-footer bg-white">
              <router-link :to="`/schedule/${schedule._id}/seats`" class="btn btn-primary w-100">
                选择座位
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-5">
        <i class="bi bi-calendar-x display-1 text-muted"></i>
        <p class="mt-3 text-muted">暂无场次</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { movieApi, scheduleApi } from '../api'

const route = useRoute()
const movie = ref(null)
const schedules = ref([])

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatTime = (date) => {
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const movieRes = await movieApi.getById(route.params.id)
    movie.value = movieRes.data
    
    const scheduleRes = await scheduleApi.getAll(route.params.id)
    schedules.value = scheduleRes.data
  } catch (err) {
    console.error('加载失败:', err)
  }
})
</script>
