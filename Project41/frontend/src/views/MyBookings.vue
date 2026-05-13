<template>
  <div class="my-bookings-page">
    <h2>我的预约记录</h2>
    
    <el-card>
      <el-table :data="bookings" style="width: 100%">
        <el-table-column prop="bookingDate" label="预约日期" width="120" />
        <el-table-column label="时间" width="150">
          <template #default="scope">
            {{ scope.row.startTime }} - {{ scope.row.endTime }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="会议主题" />
        <el-table-column label="会议室" width="150">
          <template #default="scope">
            {{ scope.row.room?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'PENDING' || scope.row.status === 'APPROVED'"
              type="danger"
              size="small"
              @click="handleCancel(scope.row)"
            >
              取消预约
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="bookings.length === 0" description="暂无预约记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../utils/api'

const bookings = ref([])

const fetchBookings = async () => {
  const response = await api.get('/api/bookings/my')
  bookings.value = response.data
}

const getStatusType = (status) => {
  const types = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    CANCELLED: '已取消'
  }
  return texts[status] || status
}

const handleCancel = (booking) => {
  ElMessageBox.confirm('确定要取消该预约吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await api.put(`/api/bookings/${booking.id}/cancel`)
    ElMessage.success('预约已取消')
    fetchBookings()
  }).catch(() => {})
}

onMounted(() => {
  fetchBookings()
})
</script>

<style scoped>
.my-bookings-page h2 {
  margin-bottom: 20px;
}
</style>
