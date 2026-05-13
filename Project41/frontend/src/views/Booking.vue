<template>
  <div class="booking-page">
    <h2>预约会议室</h2>
    
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>选择会议室</span>
          </template>
          <div v-for="room in rooms" :key="room.id" class="room-card"
               :class="{ selected: selectedRoom?.id === room.id, disabled: room.status !== 'AVAILABLE' }"
               @click="selectRoom(room)">
            <div class="room-name">{{ room.name }}</div>
            <div class="room-info">
              <el-tag size="small" :type="room.status === 'AVAILABLE' ? 'success' : 'warning'">
                {{ room.status === 'AVAILABLE' ? '可用' : '维护中' }}
              </el-tag>
              <span style="margin-left: 10px">容纳 {{ room.capacity }} 人</span>
            </div>
            <div v-if="room.location" class="room-location">{{ room.location }}</div>
            <div v-if="room.description" class="room-desc">{{ room.description }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card v-if="selectedRoom">
          <template #header>
            <span>预约时间 - {{ selectedRoom.name }}</span>
          </template>
          
          <el-form :model="bookingForm" label-width="100px">
            <el-form-item label="预约日期">
              <el-date-picker
                v-model="bookingForm.date"
                type="date"
                placeholder="选择日期"
                :disabled-date="disabledDate"
                value-format="YYYY-MM-DD"
                @change="onDateChange"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="开始时间">
              <el-time-picker
                v-model="bookingForm.startTime"
                placeholder="选择开始时间"
                :disabled-hours="disabledHours"
                format="HH:mm"
                value-format="HH:mm"
                @change="onTimeChange"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="结束时间">
              <el-time-picker
                v-model="bookingForm.endTime"
                placeholder="选择结束时间"
                :disabled-hours="disabledHours"
                format="HH:mm"
                value-format="HH:mm"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="会议主题">
              <el-input v-model="bookingForm.title" placeholder="请输入会议主题" />
            </el-form-item>
            
            <el-form-item label="会议描述">
              <el-input
                v-model="bookingForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入会议描述（可选）"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleCheckConflict" :loading="checking">检查时间冲突</el-button>
              <el-button type="success" @click="handleSubmit" :loading="submitting" :disabled="!canBook">立即预约</el-button>
            </el-form-item>
          </el-form>

          <el-alert
            v-if="conflictCheckResult"
            :title="conflictCheckResult.hasConflict ? '时间冲突' : '时间可用'"
            :type="conflictCheckResult.hasConflict ? 'error' : 'success'"
            show-icon
            style="margin-top: 20px"
          >
            <template v-if="conflictCheckResult.hasConflict">
              <p v-for="(c, idx) in conflictCheckResult.conflicts" :key="idx" style="margin: 5px 0">
                - {{ c.startTime }} - {{ c.endTime }}: {{ c.title }}
              </p>
            </template>
          </el-alert>
        </el-card>
        
        <el-card v-else>
          <el-empty description="请先选择一个会议室" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../utils/api'
import dayjs from 'dayjs'

const rooms = ref([])
const selectedRoom = ref(null)
const checking = ref(false)
const submitting = ref(false)
const conflictCheckResult = ref(null)

const bookingForm = reactive({
  date: dayjs().format('YYYY-MM-DD'),
  startTime: '09:00',
  endTime: '10:00',
  title: '',
  description: ''
})

const canBook = computed(() => {
  return selectedRoom.value && 
         bookingForm.date && 
         bookingForm.startTime && 
         bookingForm.endTime && 
         bookingForm.title
})

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

const disabledHours = () => {
  const hours = []
  for (let i = 0; i < 8; i++) hours.push(i)
  for (let i = 20; i <= 23; i++) hours.push(i)
  return hours
}

const fetchRooms = async () => {
  const response = await api.get('/api/rooms')
  rooms.value = response.data
}

const selectRoom = (room) => {
  if (room.status === 'AVAILABLE') {
    selectedRoom.value = room
    conflictCheckResult.value = null
  }
}

const onDateChange = () => {
  conflictCheckResult.value = null
}

const onTimeChange = () => {
  conflictCheckResult.value = null
}

const handleCheckConflict = async () => {
  if (!selectedRoom.value) {
    ElMessage.warning('请先选择会议室')
    return
  }
  if (!bookingForm.date || !bookingForm.startTime || !bookingForm.endTime) {
    ElMessage.warning('请选择完整的预约时间')
    return
  }

  checking.value = true
  try {
    const response = await api.get('/api/bookings/check-conflict', {
      params: {
        roomId: selectedRoom.value.id,
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime
      }
    })
    conflictCheckResult.value = response.data
  } finally {
    checking.value = false
  }
}

const handleSubmit = async () => {
  if (!canBook.value) {
    ElMessage.warning('请填写完整的预约信息')
    return
  }

  submitting.value = true
  try {
    await api.post('/api/bookings', {
      roomId: selectedRoom.value.id,
      bookingDate: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      title: bookingForm.title,
      description: bookingForm.description
    })
    ElMessage.success('预约申请已提交，请等待管理员审批')
    bookingForm.title = ''
    bookingForm.description = ''
    conflictCheckResult.value = null
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.booking-page h2 {
  margin-bottom: 20px;
}

.room-card {
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.room-card:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.room-card.selected {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.room-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.room-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
}

.room-info {
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

.room-location,
.room-desc {
  font-size: 13px;
  color: #909399;
  margin-top: 3px;
}
</style>
