<template>
  <div class="statistics-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>考勤统计</span>
          <el-button type="success" @click="exportReport">
            <el-icon><Download /></el-icon>
            导出Excel报表
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="年份">
          <el-select v-model="queryForm.year" style="width: 120px">
            <el-option v-for="y in years" :key="y" :label="y" :value="y" />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-select v-model="queryForm.month" style="width: 120px">
            <el-option v-for="m in 12" :key="m" :label="m + '月'" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="20" class="stats-cards">
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-value">{{ statistics.totalDays || 0 }}</div>
            <div class="stat-label">考勤天数</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card normal">
            <div class="stat-value">{{ statistics.normalDays || 0 }}</div>
            <div class="stat-label">正常出勤</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card warning">
            <div class="stat-value">{{ statistics.lateDays || 0 }}</div>
            <div class="stat-label">迟到天数</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card warning">
            <div class="stat-value">{{ statistics.earlyLeaveDays || 0 }}</div>
            <div class="stat-label">早退天数</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card danger">
            <div class="stat-value">{{ statistics.absentDays || 0 }}</div>
            <div class="stat-label">缺勤天数</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card info">
            <div class="stat-value">{{ (statistics.totalWorkHours || 0).toFixed(1) }}</div>
            <div class="stat-label">总工作时长</div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider content-position="left">月度详情</el-divider>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="签到时间" width="150">
          <template #default="{ row }">
            {{ formatTime(row.checkInTime) }}
            <el-tag v-if="row.checkInStatus === 'late'" type="danger" size="small">迟到</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签退时间" width="150">
          <template #default="{ row }">
            {{ formatTime(row.checkOutTime) }}
            <el-tag v-if="row.checkOutStatus === 'early'" type="warning" size="small">早退</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workHours" label="时长" width="100">
          <template #default="{ row }">{{ row.workHours || 0 }}h</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import * as dayjs from 'dayjs'

const currentYear = dayjs().year()
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

const queryForm = ref({
  year: currentYear,
  month: dayjs().month() + 1
})
const statistics = ref({})
const tableData = ref([])

const getUserId = () => localStorage.getItem('userId')

const loadData = async () => {
  const userId = getUserId()
  if (!userId) return
  try {
    const res = await axios.get(`/api/statistics/monthly/${userId}`, { params: queryForm.value })
    statistics.value = res.data
    tableData.value = res.data.attendances || []
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

const exportReport = async () => {
  const userId = getUserId()
  if (!userId) {
    ElMessage.error('请先初始化用户')
    return
  }
  try {
    const res = await axios.get(`/api/statistics/export/${userId}`, {
      params: queryForm.value,
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${queryForm.value.year}年${queryForm.value.month}月考勤报表.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const formatTime = (time) => {
  return time ? dayjs(time).format('HH:mm:ss') : '-'
}

const getStatusType = (status) => {
  const map = {
    normal: 'success',
    late: 'warning',
    early_leave: 'warning',
    absent: 'danger',
    half_day: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    normal: '正常',
    late: '迟到',
    early_leave: '早退',
    absent: '缺勤',
    half_day: '半天'
  }
  return map[status] || status
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  margin-bottom: 20px;
}
.stats-cards {
  margin-bottom: 20px;
}
.stat-card {
  text-align: center;
}
.stat-card .stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}
.stat-card .stat-label {
  color: #909399;
  font-size: 14px;
}
.stat-card.normal .stat-value {
  color: #67c23a;
}
.stat-card.warning .stat-value {
  color: #e6a23c;
}
.stat-card.danger .stat-value {
  color: #f56c6c;
}
.stat-card.info .stat-value {
  color: #409eff;
}
</style>
