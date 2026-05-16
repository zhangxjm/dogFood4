<template>
  <div class="calling-display">
    <div class="calling-section">
      <div class="big-display">
        <div class="label">当前呼叫</div>
        <div class="order-number" :class="{ 'animate': isAnimating }">
          {{ currentCall ? currentCall.order_number : '--' }}
        </div>
        <div class="customer-name">
          {{ currentCall ? currentCall.customer_name : '等待中...' }}
        </div>
      </div>
      
      <el-alert
        v-if="callMessage"
        :title="callMessage"
        type="success"
        :closable="false"
        style="margin-top: 20px"
      />
    </div>

    <el-card class="waiting-card">
      <template #header>
        <span>📋 等待队列 ({{ pendingOrders.length }})</span>
      </template>
      <el-table :data="pendingOrders" stripe>
        <el-table-column prop="order_number" label="序号" width="80" />
        <el-table-column prop="customer_name" label="顾客" />
        <el-table-column prop="items" label="菜品" show-overflow-tooltip />
        <el-table-column prop="total_amount" label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="callOrder(row.order_number)"
              :loading="callingId === row.id"
            >
              呼叫
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="called-card" style="margin-top: 20px">
      <template #header>
        <span>✅ 已叫号</span>
      </template>
      <div class="called-numbers">
        <el-tag
          v-for="order in calledOrders"
          :key="order.id"
          type="success"
          size="large"
          style="margin: 5px"
        >
          {{ order.order_number }}号 - {{ order.customer_name }}
        </el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import orderApi from '../api/orders'

const pendingOrders = ref([])
const calledOrders = ref([])
const currentCall = ref(null)
const callMessage = ref('')
const isAnimating = ref(false)
const callingId = ref(null)
let ws = null

const connectWebSocket = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/ws`
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('WebSocket connected')
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'call') {
      playNotificationSound()
      ElNotification({
        title: '叫号提醒',
        message: data.message,
        type: 'success',
        duration: 5000
      })
      callMessage.value = data.message
      loadOrders()
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  ws.onclose = () => {
    console.log('WebSocket closed, reconnecting...')
    setTimeout(connectWebSocket, 3000)
  }
}

const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.frequency.value = 800
  oscillator.type = 'sine'
  gainNode.gain.value = 0.3
  
  oscillator.start()
  setTimeout(() => {
    oscillator.stop()
  }, 500)
}

const loadOrders = async () => {
  try {
    const [pendingRes, todayRes] = await Promise.all([
      orderApi.getPendingOrders(),
      orderApi.getTodayOrders()
    ])
    pendingOrders.value = pendingRes.data
    calledOrders.value = todayRes.data.filter(o => o.is_called)
    
    if (calledOrders.value.length > 0) {
      const lastCalled = calledOrders.value[calledOrders.value.length - 1]
      if (!currentCall.value || currentCall.value.order_number !== lastCalled.order_number) {
        currentCall.value = lastCalled
        triggerAnimation()
      }
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
  }
}

const triggerAnimation = () => {
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 1000)
}

const callOrder = async (orderNumber) => {
  const order = pendingOrders.value.find(o => o.order_number === orderNumber)
  if (order) {
    callingId.value = order.id
  }
  
  try {
    await orderApi.callOrder(orderNumber)
    ElMessage.success(`已呼叫 ${orderNumber} 号`)
  } catch (error) {
    ElMessage.error('呼叫失败')
  } finally {
    callingId.value = null
  }
}

onMounted(() => {
  connectWebSocket()
  loadOrders()
  setInterval(loadOrders, 5000)
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})
</script>

<style scoped>
.calling-display {
  max-width: 1000px;
  margin: 0 auto;
}

.calling-section {
  text-align: center;
  margin-bottom: 30px;
}

.big-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  color: white;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
}

.big-display .label {
  font-size: 24px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.big-display .order-number {
  font-size: 120px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.big-display .order-number.animate {
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.big-display .customer-name {
  font-size: 28px;
  opacity: 0.95;
}

.waiting-card, .called-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.called-numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
