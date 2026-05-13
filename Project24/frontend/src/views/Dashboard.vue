<template>
  <div>
    <div class="page-header">
      <h2>📊 系统概览</h2>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h4>车辆总数</h4>
        <div class="number">{{ stats.vehicles }}</div>
      </div>
      <div class="stat-card">
        <h4>车主总数</h4>
        <div class="number">{{ stats.owners }}</div>
      </div>
      <div class="stat-card">
        <h4>车位总数</h4>
        <div class="number">{{ stats.totalSpots }}</div>
      </div>
      <div class="stat-card">
        <h4>空闲车位</h4>
        <div class="number">{{ stats.availableSpots }}</div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 1rem; color: #2c3e50;">🔍 快速查询车辆</h3>
      <div class="search-bar">
        <input
          v-model="searchPlate"
          placeholder="输入车牌号进行查询..."
          @keyup.enter="searchVehicle"
        />
        <button class="btn btn-primary" @click="searchVehicle">查询</button>
      </div>

      <div v-if="searchResults.length > 0">
        <table>
          <thead>
            <tr>
              <th>车牌号</th>
              <th>车主</th>
              <th>联系电话</th>
              <th>品牌/型号</th>
              <th>颜色</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vehicle in searchResults" :key="vehicle.id">
              <td><strong>{{ vehicle.plate_number }}</strong></td>
              <td>{{ vehicle.owner?.name || '-' }}</td>
              <td>{{ vehicle.owner?.phone || '-' }}</td>
              <td>{{ vehicle.brand || '-' }} {{ vehicle.model || '' }}</td>
              <td>{{ vehicle.color || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="searched" class="empty-state">
        <h4>未找到相关车辆</h4>
        <p>请尝试其他车牌号</p>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 1rem; color: #2c3e50;">📝 最近车辆登记</h3>
      <table v-if="recentVehicles.length > 0">
        <thead>
          <tr>
            <th>车牌号</th>
            <th>车主</th>
            <th>品牌</th>
            <th>登记时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in recentVehicles" :key="vehicle.id">
            <td><strong>{{ vehicle.plate_number }}</strong></td>
            <td>{{ vehicle.owner?.name || '-' }}</td>
            <td>{{ vehicle.brand || '-' }}</td>
            <td>{{ formatDate(vehicle.created_at) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <h4>暂无车辆登记</h4>
        <p>点击"车辆管理"开始添加车辆信息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const stats = ref({
  vehicles: 0,
  owners: 0,
  totalSpots: 0,
  availableSpots: 0
})

const searchPlate = ref('')
const searchResults = ref([])
const searched = ref(false)
const recentVehicles = ref([])

const loadStats = async () => {
  try {
    const [vehiclesRes, ownersRes, spotsRes] = await Promise.all([
      api.getVehicles(),
      api.getOwners(),
      api.getParkingSpots()
    ])
    
    stats.value.vehicles = vehiclesRes.data.data?.length || 0
    stats.value.owners = ownersRes.data.data?.length || 0
    stats.value.totalSpots = spotsRes.data.data?.length || 0
    stats.value.availableSpots = (spotsRes.data.data || []).filter(s => !s.owner_id).length
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadRecentVehicles = async () => {
  try {
    const res = await api.getVehicles()
    recentVehicles.value = (res.data.data || []).slice(0, 5)
  } catch (error) {
    console.error('Failed to load recent vehicles:', error)
  }
}

const searchVehicle = async () => {
  if (!searchPlate.value.trim()) return
  searched.value = true
  try {
    const res = await api.searchVehicleByPlate(searchPlate.value)
    searchResults.value = res.data.data || []
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadStats()
  loadRecentVehicles()
})
</script>
