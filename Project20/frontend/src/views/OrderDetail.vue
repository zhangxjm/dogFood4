<template>
  <div class="detail-page">
    <div v-if="order" class="order-detail">
      <div class="status-section" :class="order.status">
        <div class="status-icon">{{ getStatusIcon(order.status) }}</div>
        <div class="status-text">{{ getStatusText(order.status) }}</div>
      </div>

      <div class="info-section">
        <div class="info-item">
          <span class="info-label">订单号</span>
          <span class="info-value">{{ order.orderNo }}</span>
        </div>
        <div v-if="order.tableNo" class="info-item">
          <span class="info-label">桌号</span>
          <span class="info-value">{{ order.tableNo }}</span>
        </div>
        <div v-if="order.remark" class="info-item">
          <span class="info-label">备注</span>
          <span class="info-value">{{ order.remark }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">下单时间</span>
          <span class="info-value">{{ formatTime(order.createdAt) }}</span>
        </div>
      </div>

      <div class="items-section">
        <div class="section-title">商品列表</div>
        <div class="items-list">
          <div v-for="item in order.items" :key="item.id" class="item-card">
            <div class="item-main">
              <div class="item-name">{{ item.drinkName }}</div>
              <div class="item-specs">
                <span class="spec-tag">{{ getSugarLabel(item.sugar) }}</span>
                <span class="spec-tag">{{ getIceLabel(item.ice) }}</span>
              </div>
            </div>
            <div class="item-right">
              <div class="item-price">¥{{ item.price }}</div>
              <div class="item-qty">x{{ item.quantity }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="total-section">
        <div class="total-row">
          <span class="total-label">合计</span>
          <span class="total-price">¥{{ order.totalPrice.toFixed(2) }}</span>
        </div>
      </div>

      <div v-if="order.status === 'pending'" class="action-section">
        <button class="action-btn cancel" @click="cancelOrder">取消订单</button>
        <button class="action-btn complete" @click="completeOrder">确认完成</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderById, updateOrderStatus } from '../api/index'

const route = useRoute()
const router = useRouter()
const order = ref(null)

const sugarOptions = [
  { label: '无糖', value: 'none' },
  { label: '少糖', value: 'less' },
  { label: '正常', value: 'normal' },
  { label: '多糖', value: 'more' }
]

const iceOptions = [
  { label: '去冰', value: 'none' },
  { label: '少冰', value: 'less' },
  { label: '正常', value: 'normal' },
  { label: '多冰', value: 'more' }
]

const statusMap = {
  pending: { text: '待完成', icon: '⏳', class: 'pending' },
  completed: { text: '已完成', icon: '✅', class: 'completed' },
  cancelled: { text: '已取消', icon: '❌', class: 'cancelled' }
}

const getStatusText = (status) => {
  return statusMap[status]?.text || '未知'
}

const getStatusIcon = (status) => {
  return statusMap[status]?.icon || '❓'
}

const getSugarLabel = (value) => {
  const option = sugarOptions.find(o => o.value === value)
  return option ? option.label : '正常'
}

const getIceLabel = (value) => {
  const option = iceOptions.find(o => o.value === value)
  return option ? option.label : '正常'
}

const formatTime = (time) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const loadOrder = async () => {
  const id = route.params.id
  if (id) {
    try {
      const res = await getOrderById(id)
      order.value = res.data
    } catch (error) {
      console.error('加载订单详情失败:', error)
      alert('加载失败')
    }
  }
}

const cancelOrder = async () => {
  if (!order.value) return
  
  if (confirm('确定要取消这个订单吗？')) {
    try {
      await updateOrderStatus(order.value.id, 'cancelled')
      order.value.status = 'cancelled'
      alert('订单已取消')
    } catch (error) {
      console.error('取消订单失败:', error)
    }
  }
}

const completeOrder = async () => {
  if (!order.value) return
  
  if (confirm('确定要标记这个订单为已完成吗？')) {
    try {
      await updateOrderStatus(order.value.id, 'completed')
      order.value.status = 'completed'
      alert('订单已完成')
    } catch (error) {
      console.error('完成订单失败:', error)
    }
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding-bottom: 30px;
}

.status-section {
  padding: 50px 20px;
  text-align: center;
}

.status-section.pending {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.status-section.completed {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.status-section.cancelled {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.status-icon {
  font-size: 50px;
  margin-bottom: 15px;
}

.status-text {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.info-section {
  background-color: #fff;
  margin: 15px;
  padding: 20px;
  border-radius: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 15px;
  color: #666;
}

.info-value {
  font-size: 15px;
  color: #333;
}

.items-section {
  background-color: #fff;
  margin: 15px;
  padding: 20px;
  border-radius: 12px;
}

.section-title {
  font-size: 17px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.items-list {
  padding: 0;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-card:last-child {
  border-bottom: none;
}

.item-main {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.item-specs {
  margin-bottom: 0;
}

.spec-tag {
  display: inline-block;
  padding: 2px 10px;
  background-color: #fff0f0;
  color: #ff6b6b;
  font-size: 12px;
  border-radius: 4px;
  margin-right: 8px;
}

.item-right {
  text-align: right;
}

.item-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff6b6b;
  margin-bottom: 6px;
}

.item-qty {
  font-size: 14px;
  color: #999;
}

.total-section {
  background-color: #fff;
  margin: 15px;
  padding: 20px;
  border-radius: 12px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 16px;
  color: #666;
}

.total-price {
  font-size: 26px;
  font-weight: bold;
  color: #ff6b6b;
}

.action-section {
  display: flex;
  gap: 20px;
  padding: 15px;
}

.action-btn {
  flex: 1;
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.action-btn.cancel {
  background-color: #f5f5f5;
  color: #666;
}

.action-btn.complete {
  background-color: #ff6b6b;
  color: #fff;
}
</style>
