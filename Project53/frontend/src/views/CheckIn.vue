<template>
  <div class="checkin-page">
    <el-card class="checkin-card">
      <template #header>
        <div class="card-header">
          <span>今日考勤打卡</span>
          <span class="date">{{ currentDate }}</span>
        </div>
      </template>
      
      <div class="time-display">
        <div class="current-time">{{ currentTime }}</div>
        <div class="time-label">当前时间</div>
      </div>

      <div class="checkin-buttons">
        <el-button
          type="primary"
          size="large"
          :disabled="!!todayAttendance?.checkInTime"
          @click="handleCheckIn"
          class="checkin-btn"
        >
          <el-icon><Bottom /></el-icon>
          {{ todayAttendance?.checkInTime ? '已签到' : '上班签到' }}
        </el-button>
        <el-button
          type="success"
          size="large"
          :disabled="!todayAttendance?.checkInTime || !!todayAttendance?.checkOutTime"
          @click="handleCheckOut"
          class="checkout-btn"
        >
          <el-icon><Top /></el-icon>
          {{ todayAttendance?.checkOutTime ? '已签退' : '下班签退' }}
        </el-button>
      </div>

      <div v-if="todayAttendance" class="attendance-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="签到时间">
            {{ formatTime(todayAttendance.checkInTime) }}
            <el-tag v-if="todayAttendance.checkInStatus === 'late'" type="danger" size="small">迟到</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="签退时间">
            {{ formatTime(todayAttendance.checkOutTime) }}
            <el-tag v-if="todayAttendance.checkOutStatus === 'early'" type="warning" size="small">早退</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="工作时长" :span="2">
            {{ todayAttendance.workHours || 0 }} 小时
          </el-descriptions-item>
          <el-descriptions-item label="考勤状态" :span="2">
            <el-tag :type="getStatusType(todayAttendance.status)">
              {{ getStatusText(todayAttendance.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <el-card class="rules-card" style="margin-top: 20px;">
      <template #header>
        <span>考勤规则</span>
      </template>
      <el-alert
        title="上班时间：09:00，下班时间：18:00"
        type="info"
        :closable="false"
        style="margin-bottom: 10px;"
      />
      <el-alert
        title="迟到超过30分钟记为迟到，早退超过30分钟记为早退"
        type="warning"
        :closable="false"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import * as dayjs from 'dayjs'

const currentTime = ref('')
const todayAttendance = ref(null)
let timer = null

const currentDate = computed(() => dayjs().format('YYYY年MM月DD日'))

const updateTime = () => {
  currentTime.value = dayjs().format('HH:mm:ss')
}

const getUserId = () => localStorage.getItem('userId')

const loadTodayAttendance = async () => {
  const userId = getUserId()
  if (!userId) return
  try {
    const res = await axios.get(`/api/attendance/today/${userId}`)
    todayAttendance.value = res.data
  } catch (error) {
    console.error('加载今日考勤失败', error)
  }
}

const handleCheckIn = async () => {
  const userId = getUserId()
  if (!userId) {
    ElMessage.error('请先初始化用户')
    return
  }
  try {
    await axios.post('/api/attendance/check-in', { userId })
    ElMessage.success('签到成功')
    loadTodayAttendance()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '签到失败')
  }
}

const handleCheckOut = async () => {
  const userId = getUserId()
  if (!userId) {
    ElMessage.error('请先初始化用户')
    return
  }
  try {
    await axios.post('/api/attendance/check-out', { userId })
    ElMessage.success('签退成功')
    loadTodayAttendance()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '签退失败')
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
  updateTime()
  timer = setInterval(updateTime, 1000)
  loadTodayAttendance()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.checkin-page {
  max-width: 600px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.date {
  color: #909399;
  font-size: 14px;
}
.time-display {
  text-align: center;
  padding: 30px 0;
}
.current-time {
  font-size: 48px;
  font-weight: bold;
  color: #303133;
  font-family: 'Courier New', monospace;
}
.time-label {
  color: #909399;
  margin-top: 10px;
}
.checkin-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 20px 0;
}
.checkin-btn, .checkout-btn {
  width: 180px;
  height: 60px;
}
.attendance-info {
  margin-top: 20px;
}
</style>
