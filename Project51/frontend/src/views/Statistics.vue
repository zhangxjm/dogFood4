<template>
  <div class="statistics">
    <h2 class="mb-4">医生出诊统计</h2>
    <div class="row mb-4">
      <div class="col-md-3">
        <label class="form-label">开始日期</label>
        <input type="date" class="form-control" v-model="startDate">
      </div>
      <div class="col-md-3">
        <label class="form-label">结束日期</label>
        <input type="date" class="form-control" v-model="endDate">
      </div>
      <div class="col-md-3 d-flex align-items-end">
        <button class="btn btn-primary" @click="loadStatistics">查询统计</button>
      </div>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>医生姓名</th>
          <th>科室</th>
          <th>职称</th>
          <th>出诊挂号数</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stat in statistics" :key="stat.doctorId">
          <td>{{ stat.doctorName }}</td>
          <td>{{ stat.departmentName }}</td>
          <td>{{ stat.title || '-' }}</td>
          <td>
            <span class="badge bg-info">{{ stat.visitCount }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { statisticsApi } from '../api'

const statistics = ref([])
const endDate = ref(new Date().toISOString().split('T')[0])
const startDate = ref(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

const loadStatistics = async () => {
  const res = await statisticsApi.getDoctorVisits(startDate.value, endDate.value)
  if (res.code === 200) {
    statistics.value = res.data
  }
}

onMounted(() => {
  loadStatistics()
})
</script>
