<template>
  <div class="statistics">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card total-orders">
          <div class="stat-content">
            <div class="stat-icon">📋</div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total_orders || 0 }}</div>
              <div class="stat-label">今日订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card total-amount">
          <div class="stat-content">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.total_amount || 0 }}</div>
              <div class="stat-label">销售总额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card completed-orders">
          <div class="stat-content">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.completed_orders || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card pending-orders">
          <div class="stat-content">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pending_orders || 0 }}</div>
              <div class="stat-label">等待中</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>📊 今日订单详情</span>
          <el-button type="primary" size="small" @click="loadData">刷新</el-button>
        </div>
      </template>
      <el-table :data="orders" stripe>
        <el-table-column prop="order_number" label="订单号" width="100" />
        <el-table-column prop="customer_name" label="顾客" width="120" />
        <el-table-column prop="items" label="菜品" show-overflow-tooltip />
        <el-table-column prop="total_amount" label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
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

const statistics = ref({})
const orders = ref([])

const loadData = async () => {
  try {
    const [statsRes, ordersRes] = await Promise.all([
      orderApi.getStatistics(),
      orderApi.getTodayOrders()
    ])
    statistics.value = statsRes.data
    orders.value = ordersRes.data.sort((a, b) => b.order_number - a.order_number)
  } catch (error) {
    ElMessage.error('加载数据失败')
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
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadData()
  setInterval(loadData, 30000)
})
</script>

<style scoped>
.statistics {
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.total-orders .stat-value {
  color: #409eff;
}

.total-amount .stat-value {
  color: #67c23a;
}

.completed-orders .stat-value {
  color: #e6a23c;
}

.pending-orders .stat-value {
  color: #f56c6c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
