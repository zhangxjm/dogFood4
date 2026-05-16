<template>
  <div class="order-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📋 订单管理</span>
          <el-button type="primary" size="small" @click="loadOrders">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="orders" stripe style="width: 100%">
        <el-table-column prop="order_number" label="订单号" width="100" />
        <el-table-column prop="customer_name" label="顾客姓名" width="120" />
        <el-table-column prop="items" label="菜品" show-overflow-tooltip />
        <el-table-column prop="total_amount" label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已叫号" width="100">
          <template #default="{ row }">
            <el-icon :color="row.is_called ? '#67c23a' : '#909399'">
              <component :is="row.is_called ? 'Check' : 'Close'" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button
              v-if="row.status !== 'preparing'"
              size="small"
              type="warning"
              @click="updateStatus(row.id, 'preparing')"
            >
              制作中
            </el-button>
            <el-button
              v-if="row.status !== 'ready'"
              size="small"
              type="success"
              @click="updateStatus(row.id, 'ready')"
            >
              已完成
            </el-button>
            <el-button
              v-if="row.status !== 'completed'"
              size="small"
              type="primary"
              @click="updateStatus(row.id, 'completed')"
            >
              已取餐
            </el-button>
            <el-button
              v-if="!row.is_called"
              size="small"
              @click="callOrder(row.order_number)"
            >
              呼叫
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import orderApi from '../api/orders'

const orders = ref([])

const loadOrders = async () => {
  try {
    const res = await orderApi.getTodayOrders()
    orders.value = res.data.sort((a, b) => b.order_number - a.order_number)
  } catch (error) {
    ElMessage.error('加载订单失败')
  }
}

const getStatusType = (status) => {
  const types = {
    pending: 'info',
    preparing: 'warning',
    ready: 'success',
    completed: 'primary'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '等待中',
    preparing: '制作中',
    ready: '已完成',
    completed: '已取餐'
  }
  return texts[status] || status
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const updateStatus = async (orderId, status) => {
  try {
    await orderApi.updateStatus(orderId, status)
    ElMessage.success('状态更新成功')
    loadOrders()
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

const callOrder = async (orderNumber) => {
  try {
    await orderApi.callOrder(orderNumber)
    ElMessage.success(`已呼叫 ${orderNumber} 号`)
    loadOrders()
  } catch (error) {
    ElMessage.error('呼叫失败')
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-management {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
