<template>
  <div>
    <h2 class="mb-4">
      <i class="bi bi-bar-chart-line me-2"></i>票房统计
    </h2>

    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card shadow text-center h-100">
          <div class="card-body">
            <i class="bi bi-currency-yen display-4 text-primary mb-2"></i>
            <h3 class="card-title">¥{{ summary.totalBoxOffice.toLocaleString() }}</h3>
            <p class="card-text text-muted">总票房</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow text-center h-100">
          <div class="card-body">
            <i class="bi bi-ticket display-4 text-success mb-2"></i>
            <h3 class="card-title">{{ summary.totalTickets.toLocaleString() }}</h3>
            <p class="card-text text-muted">总售票数</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow text-center h-100">
          <div class="card-body">
            <i class="bi bi-receipt display-4 text-info mb-2"></i>
            <h3 class="card-title">{{ summary.totalOrders.toLocaleString() }}</h3>
            <p class="card-text text-muted">总订单数</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow">
      <div class="card-body">
        <h4 class="card-title mb-4">各电影票房排行</h4>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>排名</th>
                <th>电影名称</th>
                <th>票房收入</th>
                <th>售票数</th>
                <th>订单数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in movieStats" :key="item.movieId">
                <td>
                  <span class="badge" :class="getRankClass(index + 1)">
                    {{ index + 1 }}
                  </span>
                </td>
                <td>{{ item.movieTitle }}</td>
                <td class="text-danger fw-bold">¥{{ item.totalSales.toLocaleString() }}</td>
                <td>{{ item.ticketCount }}</td>
                <td>{{ item.orderCount }}</td>
              </tr>
              <tr v-if="movieStats.length === 0">
                <td colspan="5" class="text-center text-muted py-4">暂无数据</td>
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
import { statsApi } from '../api'

const movieStats = ref([])
const summary = ref({
  totalBoxOffice: 0,
  totalTickets: 0,
  totalOrders: 0
})

const getRankClass = (rank) => {
  if (rank === 1) return 'bg-warning'
  if (rank === 2) return 'bg-secondary'
  if (rank === 3) return 'bg-danger'
  return 'bg-primary'
}

onMounted(async () => {
  try {
    const res = await statsApi.getBoxOffice()
    movieStats.value = res.data.movieStats
    summary.value = res.data.summary
  } catch (err) {
    console.error('加载统计数据失败:', err)
  }
})
</script>
