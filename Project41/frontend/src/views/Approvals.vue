<template>
  <div class="approvals-page">
    <h2>预约审批</h2>
    
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="待审批" name="pending">
        <el-card>
          <el-table :data="pendingBookings" style="width: 100%">
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
            <el-table-column label="申请人" width="120">
              <template #default="scope">
                {{ scope.row.user?.name || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="success" size="small" @click="handleApprove(scope.row)">通过</el-button>
                <el-button type="danger" size="small" @click="handleReject(scope.row)">拒绝</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="pendingBookings.length === 0" description="暂无待审批的预约" />
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="已通过" name="approved">
        <el-card>
          <el-table :data="approvedBookings" style="width: 100%">
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
            <el-table-column label="申请人" width="120">
              <template #default="scope">
                {{ scope.row.user?.name || '-' }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="approvedBookings.length === 0" description="暂无已通过的预约" />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝预约"
      width="400px"
    >
      <el-form>
        <el-form-item label="拒绝原因">
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject" :loading="submitting">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../utils/api'

const activeTab = ref('pending')
const pendingBookings = ref([])
const approvedBookings = ref([])
const rejectDialogVisible = ref(false)
const submitting = ref(false)
const rejectReason = ref('')
const currentBookingId = ref(null)

const fetchPendingBookings = async () => {
  const response = await api.get('/api/bookings/pending')
  pendingBookings.value = response.data
}

const fetchApprovedBookings = async () => {
  const response = await api.get('/api/bookings/approved')
  approvedBookings.value = response.data
}

const onTabChange = (tab) => {
  if (tab === 'pending') {
    fetchPendingBookings()
  } else if (tab === 'approved') {
    fetchApprovedBookings()
  }
}

const handleApprove = (booking) => {
  ElMessageBox.confirm('确定要通过该预约吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    await api.put(`/api/bookings/${booking.id}/approve`)
    ElMessage.success('审批通过')
    fetchPendingBookings()
  }).catch(() => {})
}

const handleReject = (booking) => {
  currentBookingId.value = booking.id
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  submitting.value = true
  try {
    await api.put(`/api/bookings/${currentBookingId.value}/reject`, {
      reason: rejectReason.value
    })
    ElMessage.success('已拒绝预约')
    rejectDialogVisible.value = false
    fetchPendingBookings()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchPendingBookings()
})
</script>

<style scoped>
.approvals-page h2 {
  margin-bottom: 20px;
}
</style>
