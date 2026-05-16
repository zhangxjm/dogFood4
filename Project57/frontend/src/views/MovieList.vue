<template>
  <div>
    <h2 class="mb-4">
      <i class="bi bi-film me-2"></i>正在热映
    </h2>
    <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
      <div class="col" v-for="movie in movies" :key="movie._id">
        <div class="card h-100 shadow-sm hover-shadow">
          <div class="card-img-top bg-secondary d-flex align-items-center justify-content-center" style="height: 300px;">
            <i class="bi bi-film text-white display-1"></i>
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ movie.title }}</h5>
            <p class="card-text text-muted small">
              <i class="bi bi-tag me-1"></i>{{ movie.genre }}
              <span class="mx-2">|</span>
              <i class="bi bi-clock me-1"></i>{{ movie.duration }}分钟
            </p>
            <p class="card-text small">{{ movie.description }}</p>
          </div>
          <div class="card-footer bg-white">
            <router-link :to="`/movie/${movie._id}`" class="btn btn-primary w-100">
              <i class="bi bi-ticket me-2"></i>选座购票
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <div v-if="movies.length === 0" class="text-center py-5">
      <i class="bi bi-film display-1 text-muted"></i>
      <p class="mt-3 text-muted">暂无电影</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { movieApi } from '../api'

const movies = ref([])

onMounted(async () => {
  try {
    const res = await movieApi.getAll()
    movies.value = res.data
  } catch (err) {
    console.error('加载电影失败:', err)
  }
})
</script>

<style scoped>
.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
  transition: all .3s ease;
}
</style>
