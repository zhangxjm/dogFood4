<template>
  <div>
    <h2 class="mb-4">
      <i class="bi bi-receipt me-2"></i>订单查询
    </h2>

    <div class="card shadow mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">手机号</label>
            <input type="tel" class="form-control" v-model="searchPhone" placeholder="输入手机号查询">
          </div>
          <div class="col-md-4">
            <label class="form-label">订单号</label>
            <input type="text" class="form-control" v-model="searchOrderNo" placeholder="输入订单号查询">
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <button class="btn btn-primary w-100" @click="searchOrders">
              <i class="bi bi-search me-2"></i>查询
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="orders.length > 0">
      <div class="card shadow mb-3" v-for="order in orders" :key="order._id">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="card-title">{{ order.movie.title }}</h5>
              <p class="text-muted mb-2">
                订单号：<strong>{{ order.orderNo }}</strong>
                <span class="ms-3">
                  <span class="badge" :class="getStatusClass(order.status)">
                    {{ getStatusText(order.status) }}
                  </span>
                </span>
              </p>
              <p class="mb-1">
                <i class="bi bi-calendar me-2"></i>{{ formatDate(order.schedule.startTime) }}
                <i class="bi bi-clock ms-3 me-2"></i>{{ formatTime(order.schedule.startTime) }}
                <i class="bi bi-geo-alt ms-3 me-2"></i>{{ order.schedule.theater }}
              </p>
              <p class="mb-1">
                <i class="bi bi-people me-2"></i>{{ order.customerName }}
                <i class="bi bi-telephone ms-3 me-2"></i>{{ order.customerPhone }}
              </p>
              <p class="mb-0">
                <i class="bi bi-ticket me-2"></i>座位：{{ order.seatNumbers.join(', ') }}
                <span class="ms-3 text-danger fw-bold">¥{{ order.totalPrice }}</span>
              </p>
            </div>
            <button
              v-if="order.status === 'paid'"
              class="btn btn-outline-danger btn-sm"
              @click="cancelOrder(order._id)"
            >
              取消订单
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <i class="bi bi-receipt display-1 text-muted"></i>
      <p class="mt-3 text-muted">暂无订单记录</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { orderApi } from '../api'

const orders = ref([])
const searchPhone = ref('')
const searchOrderNo = ref('')

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatTime = (date) => {
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const getStatusClass = (status) => {
  const map = {
    pending: 'bg-warning',
    paid: 'bg-success',
    cancelled: 'bg-secondary'
  }
  return map[status] || 'bg-secondary'
}

const getStatusText = (status) => {
  const map = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消'
  }
  return map[status] || status
}

const searchOrders = async () => {
  try {
    const params = {}
    if (searchPhone.value) params.phone = searchPhone.value
    if (searchOrderNo.value) params.orderNo = searchOrderNo.value
    const res = await orderApi.getAll(params)
    orders.value = res.data
  } catch (err) {
    console.error('查询订单失败:', err)
    alert('查询订单失败')
  }
}

const cancelOrder = async (orderId) => {
  if (!confirm('确定要取消该订单吗？')) return
  
  try {
    await orderApi.cancel(orderId)
    alert('取消订单成功')
    await searchOrders()
  } catch (err) {
    console.error('取消订单失败:', err)
    alert('取消订单失败')
  }
}

onMounted(() => {
  searchOrders()
})
</script>
