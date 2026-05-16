<template>
  <div class="admin-stats">
    <h3 class="mb-4">访问统计</h3>
    
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <h4 class="card-title">{{ todayStats.page_views || 0 }}</h4>
            <p class="card-text text-muted">今日浏览量</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <h4 class="card-title">{{ todayStats.unique_visitors || 0 }}</h4>
            <p class="card-text text-muted">今日独立访客</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <h4 class="card-title">{{ todayStats.new_visitors || 0 }}</h4>
            <p class="card-text text-muted">今日新访客</p>
          </div>
        </div>
      </div>
    </div>

    <h4 class="mb-3">最近访客</h4>
    <div class="table-responsive mb-4">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>IP地址</th>
            <th>首次访问</th>
            <th>最后访问</th>
            <th>访问次数</th>
            <th>页面浏览量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="visitor in visitors" :key="visitor.id">
            <td>{{ visitor.ip_address }}</td>
            <td>{{ formatDate(visitor.first_visit) }}</td>
            <td>{{ formatDate(visitor.last_visit) }}</td>
            <td>{{ visitor.visit_count }}</td>
            <td>{{ visitor.page_views }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4 class="mb-3">历史统计</h4>
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>日期</th>
            <th>页面浏览量</th>
            <th>独立访客</th>
            <th>新访客</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in dailyStats" :key="stat.id">
            <td>{{ stat.date }}</td>
            <td>{{ stat.page_views }}</td>
            <td>{{ stat.unique_visitors }}</td>
            <td>{{ stat.new_visitors }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { statsAPI } from '../../api'

const visitors = ref([])
const dailyStats = ref([])

const todayStats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return dailyStats.value.find(s => s.date === today) || {}
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const loadStats = async () => {
  try {
    const [visitorsRes, dailyRes] = await Promise.all([
      statsAPI.visitors(),
      statsAPI.daily()
    ])
    visitors.value = visitorsRes.data.results || visitorsRes.data
    dailyStats.value = dailyRes.data.results || dailyRes.data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>
