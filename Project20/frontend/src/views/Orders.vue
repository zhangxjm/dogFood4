<template>
  <div class="orders-page">
    <div class="page-header">
      <h1>📦 我的订单</h1>
    </div>

    <div v-if="orders.length === 0" class="empty-orders">
      <div class="empty-icon">📋</div>
      <div class="empty-text">暂无订单</div>
      <div class="empty-tip">快去下单吧~</div>
    </div>

    <div v-else class="orders-list">
      <div 
        v-for="order in orders" 
        :key="order.id" 
        class="order-card"
        @click="goToDetail(order.id)"
      >
        <div class="order-header">
          <div class="order-no">订单号: {{ order.orderNo }}</div>
          <div class="order-status" :class="order.status">
            {{ getStatusText(order.status) }}
          </div>
        </div>

        <div class="order-items">
          <div v-for="(item, index) in order.items.slice(0, 2)" :key="item.id" class="item-row">
            <span class="item-name">{{ item.drinkName }}</span>
            <span class="item-qty">x{{ item.quantity }}</span>
          </div>
          <div v-if="order.items.length > 2" class="more-items">
            还有 {{ order.items.length - 2 }} 件商品...
          </div>
        </div>

        <div class="order-footer">
          <div class="order-time">{{ formatTime(order.createdAt) }}</div>
          <div class="order-total">合计: ¥{{ order.totalPrice.toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import { getOrders } from '../api/index'

const router = useRouter()
const orders = ref([])

const statusMap = {
  pending: { text: '待完成', class: 'pending' },
  completed: { text: '已完成', class: 'completed' },
  cancelled: { text: '已取消', class: 'cancelled' }
}

const getStatusText = (status) => {
  return statusMap[status]?.text || '未知'
}

const formatTime = (time) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const goToDetail = (id) => {
  router.push(`/orders/${id}`)
}

const loadOrders = async () => {
  try {
    const res = await getOrders()
    orders.value = res.data
  } catch (error) {
    console.error('加载订单失败:', error)
  }
}

onMounted(() => {
  loadOrders()
})

onBeforeRouteUpdate(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  padding: 30px 20px;
  color: #fff;
}

.page-header h1 {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 20px;
  color: #666;
  margin-bottom: 8px;
}

.empty-tip {
  font-size: 16px;
  color: #999;
}

.orders-list {
  padding: 15px;
}

.order-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.order-no {
  font-size: 14px;
  color: #666;
}

.order-status {
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 13px;
}

.order-status.pending {
  background-color: #fff3e0;
  color: #ff9800;
}

.order-status.completed {
  background-color: #e8f5e9;
  color: #4caf50;
}

.order-status.cancelled {
  background-color: #f5f5f5;
  color: #999;
}

.order-items {
  margin-bottom: 15px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.item-name {
  font-size: 15px;
  color: #333;
}

.item-qty {
  font-size: 15px;
  color: #666;
}

.more-items {
  font-size: 13px;
  color: #999;
  padding: 6px 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f5f5f5;
}

.order-time {
  font-size: 13px;
  color: #999;
}

.order-total {
  font-size: 16px;
  font-weight: bold;
  color: #ff6b6b;
}
</style>
