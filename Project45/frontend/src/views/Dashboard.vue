<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF">
              <el-icon><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ inventoryStats.total_products || 0 }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ inventoryStats.total_stock || 0 }}</div>
              <div class="stat-label">库存总量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #E6A23C">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ inventoryStats.low_stock_count || 0 }}</div>
              <div class="stat-label">低库存商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #F56C6C">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatMoney(inventoryStats.total_value || 0) }}</div>
              <div class="stat-label">库存总价值</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>出入库统计</span>
            </div>
          </template>
          <div class="transaction-stats">
            <div class="stat-item">
              <div class="stat-item-label">入库次数</div>
              <div class="stat-item-value" style="color: #67C23A">{{ transactionStats.inbound_count || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-item-label">入库总量</div>
              <div class="stat-item-value" style="color: #67C23A">{{ transactionStats.inbound_quantity || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-item-label">出库次数</div>
              <div class="stat-item-value" style="color: #F56C6C">{{ transactionStats.outbound_count || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-item-label">出库总量</div>
              <div class="stat-item-value" style="color: #F56C6C">{{ transactionStats.outbound_quantity || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近预警</span>
              <el-button text type="primary" @click="$router.push('/alerts')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentAlerts" style="width: 100%" v-loading="loading">
            <el-table-column prop="product_name" label="商品名称" />
            <el-table-column prop="current_stock" label="当前库存">
              <template #default="scope">
                <el-tag type="danger" size="small">{{ scope.row.current_stock }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="min_stock" label="最低库存" />
            <el-table-column prop="created_at" label="时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="recentAlerts.length === 0 && !loading" description="暂无预警" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getInventoryStatistics, getTransactionStatistics } from '@/api/inventory'
import { getAlerts } from '@/api/alert'

const inventoryStats = ref({})
const transactionStats = ref({})
const recentAlerts = ref([])
const loading = ref(false)

const formatMoney = (value) => {
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    inventoryStats.value = await getInventoryStatistics()
    transactionStats.value = await getTransactionStatistics()
    
    const alertsRes = await getAlerts({ page: 1, page_size: 5 })
    recentAlerts.value = alertsRes.list || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.stat-item-label {
  font-size: 14px;
  color: #909399;
}

.stat-item-value {
  font-size: 32px;
  font-weight: bold;
  margin-top: 8px;
}
</style>
