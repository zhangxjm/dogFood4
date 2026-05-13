<template>
  <div class="staff-page page">
    <van-nav-bar title="店员端" :arrow="false">
      <template #right>
        <span @click="refresh" class="refresh-btn">
          <van-icon name="refresh" /> 刷新
        </span>
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="activeTab">
      <van-tab title="待接单">
        <div class="order-list" v-if="pendingOrders.length > 0">
          <div
            v-for="order in pendingOrders"
            :key="order.orderNo"
            class="order-card"
            @click="viewOrder(order)"
          >
            <div class="order-header">
              <span class="order-no">订单号: {{ order.orderNo }}</span>
              <span class="price">¥{{ order.payAmount }}</span>
            </div>
            <div class="order-meta">
              <span>桌号: {{ tableMap[order.tableId]?.tableName || '未知' }}</span>
              <span>{{ formatTime(order.createdAt) }}</span>
            </div>
            <div class="order-actions">
              <van-button type="success" size="small" @click.stop="confirmOrder(order)">
                确认接单
              </van-button>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无待接单" />
      </van-tab>

      <van-tab title="进行中">
        <div class="order-list" v-if="processingOrders.length > 0">
          <div
            v-for="order in processingOrders"
            :key="order.orderNo"
            class="order-card"
            @click="viewOrder(order)"
          >
            <div class="order-header">
              <span class="order-no">订单号: {{ order.orderNo }}</span>
              <span class="price">¥{{ order.payAmount }}</span>
            </div>
            <div class="order-meta">
              <span>桌号: {{ tableMap[order.tableId]?.tableName || '未知' }}</span>
              <span :class="['status-badge', 'status-' + order.status.toLowerCase()]">
                {{ statusText(order.status) }}
              </span>
            </div>
            <div class="order-actions">
              <van-button type="primary" size="small" @click.stop="completeOrder(order)">
                完成订单
              </van-button>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无进行中的订单" />
      </van-tab>
    </van-tabs>

    <van-popup v-model:show="orderDetailVisible" position="right" :style="{ width: '90%' }">
      <div class="order-detail-popup" v-if="currentOrder">
        <van-nav-bar title="订单详情" left-arrow @click-left="orderDetailVisible = false" />
        <div class="detail-content">
          <van-cell-group>
            <van-cell title="订单号" :value="currentOrder.orderNo" />
            <van-cell title="桌号" :value="tableMap[currentOrder.tableId]?.tableName" />
            <van-cell title="下单时间" :value="formatTime(currentOrder.createdAt)" />
            <van-cell title="金额" :value="'¥' + currentOrder.payAmount" />
            <van-cell v-if="currentOrder.remark" title="备注" :value="currentOrder.remark" />
          </van-cell-group>

          <div class="section-title">商品</div>
          <van-cell-group>
            <van-cell
              v-for="item in currentOrderItems"
              :key="item.id"
              :title="item.dishName"
              :value="'x' + item.quantity + '  ¥' + item.amount"
            />
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getPendingOrders, getOrder, getTables, updateOrderStatus } from '@/api'

const activeTab = ref(0)
const pendingOrders = ref([])
const processingOrders = ref([])
const tables = ref([])
const tableMap = ref({})
const orderDetailVisible = ref(false)
const currentOrder = ref(null)
const currentOrderItems = ref([])

let timer = null

const statusText = (status) => {
  const map = {
    PENDING: '待确认',
    CONFIRMED: '已接单',
    PREPARING: '制作中',
    COMPLETED: '已完成'
  }
  return map[status] || status
}

const formatTime = (time) => {
  if (!time) return ''
  const t = new Date(time)
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
}

const loadData = async () => {
  try {
    const [orders, tableList] = await Promise.all([
      getPendingOrders(),
      getTables()
    ])
    tables.value = tableList
    tableMap.value = {}
    tableList.forEach(t => { tableMap.value[t.id] = t })
    
    pendingOrders.value = orders.filter(o => o.status === 'PENDING')
    processingOrders.value = orders.filter(o => ['CONFIRMED', 'PREPARING'].includes(o.status))
  } catch (e) {
    console.error(e)
  }
}

const viewOrder = async (order) => {
  try {
    const detail = await getOrder(order.orderNo)
    currentOrder.value = detail.order
    currentOrderItems.value = detail.items
    orderDetailVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

const confirmOrder = async (order) => {
  try {
    await showConfirmDialog({
      title: '确认接单',
      message: `确认接取桌号 ${tableMap.value[order.tableId]?.tableName} 的订单？`
    })
    await updateOrderStatus(order.orderNo, 'CONFIRMED')
    showToast('接单成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const completeOrder = async (order) => {
  try {
    await showConfirmDialog({
      title: '完成订单',
      message: '确认该订单已完成？'
    })
    await updateOrderStatus(order.orderNo, 'COMPLETED')
    showToast('订单已完成')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const refresh = () => {
  loadData()
}

onMounted(() => {
  loadData()
  timer = setInterval(loadData, 10000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="less">
.staff-page {
  padding-top: 0;
}

.refresh-btn {
  font-size: 14px;
  color: #1989fa;
}

.order-list {
  padding: 10px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .order-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .order-no {
      font-size: 13px;
      color: #666;
    }
    
    .price {
      font-size: 16px;
    }
  }
  
  .order-meta {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #666;
    margin-bottom: 12px;
  }
  
  .order-actions {
    text-align: right;
  }
}

.detail-content {
  padding: 10px;
  padding-bottom: 20px;
}

.section-title {
  padding: 10px 0;
  font-size: 14px;
  color: #666;
  font-weight: bold;
}
</style>
