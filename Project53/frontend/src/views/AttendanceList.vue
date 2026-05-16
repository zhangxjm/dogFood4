<template>
  <div class="attendance-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>考勤记录</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="开始日期">
          <el-date-picker v-model="queryForm.startDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="queryForm.endDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

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
        <el-table-column prop="workHours" label="工作时长" width="120">
          <template #default="{ row }">{{ row.workHours || 0 }} 小时</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="异常" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.hasException" type="danger">是</el-tag>
            <el-tag v-else type="success">否</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import * as dayjs from 'dayjs'

const queryForm = ref({
  startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD')
})
const tableData = ref([])

const getUserId = () => localStorage.getItem('userId')

const loadData = async () => {
  const userId = getUserId()
  if (!userId) return
  try {
    const params = { ...queryForm.value, userId }
    const res = await axios.get('/api/attendance', { params })
    tableData.value = res.data
  } catch (error) {
    console.error('加载考勤记录失败', error)
  }
}

const resetQuery = () => {
  queryForm.value = {
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  }
  loadData()
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
.search-form {
  margin-bottom: 20px;
}
</style>
