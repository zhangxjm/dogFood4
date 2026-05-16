<template>
  <div>
    <button class="btn btn-outline-secondary mb-4" @click="$router.back()">
      <i class="bi bi-arrow-left me-2"></i>返回
    </button>

    <div v-if="schedule" class="card shadow mb-4">
      <div class="card-body">
        <h3 class="card-title">{{ schedule.movie.title }}</h3>
        <div class="text-muted">
          <span class="me-4"><i class="bi bi-calendar me-1"></i>{{ formatDate(schedule.startTime) }}</span>
          <span class="me-4"><i class="bi bi-clock me-1"></i>{{ formatTime(schedule.startTime) }}</span>
          <span class="me-4"><i class="bi bi-geo-alt me-1"></i>{{ schedule.theater }}</span>
          <span class="text-success fw-bold"><i class="bi bi-currency-yen"></i>{{ schedule.price }}/张</span>
        </div>
      </div>
    </div>

    <div class="card shadow">
      <div class="card-body">
        <h4 class="card-title mb-4">选择座位</h4>
        
        <div class="d-flex justify-content-center mb-4">
          <div class="bg-dark text-white text-center py-2 px-5 rounded-3">
            <i class="bi bi-display me-2"></i>银幕
          </div>
        </div>

        <div class="d-flex justify-content-center mb-4">
          <div class="seat-legend">
            <span class="me-3">
              <span class="seat available"></span> 可选
            </span>
            <span class="me-3">
              <span class="seat selected"></span> 已选
            </span>
            <span class="me-3">
              <span class="seat locked"></span> 锁定
            </span>
            <span>
              <span class="seat sold"></span> 已售
            </span>
          </div>
        </div>

        <div class="d-flex justify-content-center">
          <div class="seating-chart">
            <div v-for="(row, rowIndex) in seatMatrix" :key="rowIndex" class="seat-row">
              <span class="row-label">{{ String.fromCharCode(65 + rowIndex) }}</span>
              <button
                v-for="seat in row"
                :key="seat._id"
                class="seat"
                :class="getSeatClass(seat)"
                :disabled="seat.status !== 'available'"
                @click="toggleSeat(seat)"
              >
                {{ seat.col }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="selectedSeats.length > 0" class="mt-4 p-4 bg-light rounded-3">
          <h5>已选座位</h5>
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="badge bg-primary me-2" v-for="seat in selectedSeats" :key="seat._id">
                {{ seat.seatNumber }}
              </span>
              <p class="mt-2 mb-0">
                共 <strong>{{ selectedSeats.length }}</strong> 张票，
                总计 <strong class="text-danger">¥{{ totalPrice }}</strong>
              </p>
            </div>
            <button class="btn btn-primary btn-lg" @click="showOrderModal = true">
              确认购票
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" ref="orderModal" tabindex="-1" :class="{ show: showOrderModal }" :style="{ display: showOrderModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">填写订单信息</h5>
            <button type="button" class="btn-close" @click="showOrderModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">姓名</label>
              <input type="text" class="form-control" v-model="orderForm.customerName" placeholder="请输入姓名">
            </div>
            <div class="mb-3">
              <label class="form-label">手机号</label>
              <input type="tel" class="form-control" v-model="orderForm.customerPhone" placeholder="请输入手机号">
            </div>
            <div class="alert alert-info">
              <p class="mb-1">座位：{{ selectedSeats.map(s => s.seatNumber).join(', ') }}</p>
              <p class="mb-0">总价：<strong>¥{{ totalPrice }}</strong></p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showOrderModal = false">取消</button>
            <button type="button" class="btn btn-primary" @click="submitOrder" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              确认支付
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showOrderModal" class="modal-backdrop fade show"></div>

    <div class="modal fade" tabindex="-1" :class="{ show: showSuccessModal }" :style="{ display: showSuccessModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-body text-center py-5">
            <i class="bi bi-check-circle-fill text-success display-1"></i>
            <h4 class="mt-3">购票成功！</h4>
            <p class="text-muted">订单号：{{ orderResult?.orderNo }}</p>
            <button class="btn btn-primary mt-3" @click="goToOrders">查看订单</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showSuccessModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scheduleApi, seatApi, orderApi } from '../api'

const route = useRoute()
const router = useRouter()

const schedule = ref(null)
const seats = ref([])
const selectedSeats = ref([])
const showOrderModal = ref(false)
const showSuccessModal = ref(false)
const loading = ref(false)
const orderResult = ref(null)
const userId = ref('user_' + Date.now())

const orderForm = ref({
  customerName: '',
  customerPhone: ''
})

const seatMatrix = computed(() => {
  const matrix = []
  const rows = {}
  seats.value.forEach(seat => {
    if (!rows[seat.row]) rows[seat.row] = []
    rows[seat.row][seat.col - 1] = seat
  })
  Object.keys(rows).sort().forEach(row => {
    matrix.push(rows[row])
  })
  return matrix
})

const totalPrice = computed(() => {
  return selectedSeats.value.length * (schedule.value?.price || 0)
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatTime = (date) => {
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const getSeatClass = (seat) => {
  if (selectedSeats.value.find(s => s._id === seat._id)) {
    return 'selected'
  }
  return seat.status
}

const toggleSeat = async (seat) => {
  const index = selectedSeats.value.findIndex(s => s._id === seat._id)
  if (index > -1) {
    selectedSeats.value.splice(index, 1)
  } else {
    selectedSeats.value.push(seat)
  }
}

const lockSeats = async () => {
  try {
    const seatIds = selectedSeats.value.map(s => s._id)
    await seatApi.lock(seatIds, userId.value)
  } catch (err) {
    console.error('锁定座位失败:', err)
    alert('座位锁定失败，请重新选择')
    selectedSeats.value = []
    loadSeats()
  }
}

const unlockSeats = async () => {
  if (selectedSeats.value.length > 0) {
    try {
      const seatIds = selectedSeats.value.map(s => s._id)
      await seatApi.unlock(seatIds)
    } catch (err) {
      console.error('解锁座位失败:', err)
    }
  }
}

const submitOrder = async () => {
  if (!orderForm.value.customerName || !orderForm.value.customerPhone) {
    alert('请填写姓名和手机号')
    return
  }

  loading.value = true
  try {
    await lockSeats()
    
    const res = await orderApi.create({
      scheduleId: route.params.scheduleId,
      movieId: schedule.value.movie._id,
      seatIds: selectedSeats.value.map(s => s._id),
      customerName: orderForm.value.customerName,
      customerPhone: orderForm.value.customerPhone,
      totalPrice: totalPrice.value
    })

    orderResult.value = res.data
    showOrderModal.value = false
    showSuccessModal.value = true
  } catch (err) {
    console.error('提交订单失败:', err)
    alert('提交订单失败，请重试')
    loadSeats()
  } finally {
    loading.value = false
  }
}

const goToOrders = () => {
  router.push('/orders')
}

const loadSeats = async () => {
  try {
    const res = await seatApi.getBySchedule(route.params.scheduleId)
    seats.value = res.data
  } catch (err) {
    console.error('加载座位失败:', err)
  }
}

onMounted(async () => {
  try {
    const scheduleRes = await scheduleApi.getById(route.params.scheduleId)
    schedule.value = scheduleRes.data
    await loadSeats()
  } catch (err) {
    console.error('加载数据失败:', err)
  }
})

onUnmounted(() => {
  unlockSeats()
})
</script>

<style scoped>
.seat {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px 6px 10px 10px;
  margin: 2px;
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.seat.available {
  background-color: #dee2e6;
  color: #495057;
}

.seat.available:hover {
  background-color: #adb5bd;
}

.seat.selected {
  background-color: #0d6efd;
  color: white;
}

.seat.locked {
  background-color: #ffc107;
  color: #495057;
  cursor: not-allowed;
}

.seat.sold {
  background-color: #dc3545;
  color: white;
  cursor: not-allowed;
}

.seat-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.row-label {
  width: 30px;
  text-align: center;
  font-weight: bold;
  color: #6c757d;
}

.seat-legend {
  display: flex;
  align-items: center;
}

.seat-legend .seat {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 4px;
  vertical-align: middle;
}

.seating-chart {
  display: inline-block;
}
</style>
