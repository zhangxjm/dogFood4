<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ stats.productCount }}</div>
              <div class="stat-label">商品数量</div>
            </div>
            <div class="stat-icon product">
              <el-icon :size="40"><Goods /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ stats.orderCount }}</div>
              <div class="stat-label">订单数量</div>
            </div>
            <div class="stat-icon order">
              <el-icon :size="40"><Document /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ stats.customerCount }}</div>
              <div class="stat-label">客户数量</div>
            </div>
            <div class="stat-icon customer">
              <el-icon :size="40"><User /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ stats.alertCount }}</div>
              <div class="stat-label">待处理预警</div>
            </div>
            <div class="stat-icon alert">
              <el-icon :size="40"><Warning /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>最近采购订单</span>
              <el-button type="primary" link @click="$router.push('/purchase')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentPurchases" stripe>
            <el-table-column prop="orderNo" label="订单号" width="200" />
            <el-table-column prop="totalAmount" label="金额" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 3 ? 'success' : 'warning'">
                  {{ statusMap[scope.row.status] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>最近销售订单</span>
              <el-button type="primary" link @click="$router.push('/sales')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentSales" stripe>
            <el-table-column prop="orderNo" label="订单号" width="200" />
            <el-table-column prop="totalAmount" label="金额" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 3 ? 'success' : 'warning'">
                  {{ statusMap[scope.row.status] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  productCount: 0,
  orderCount: 0,
  customerCount: 0,
  alertCount: 0
})

const recentPurchases = ref([])
const recentSales = ref([])

const statusMap = {
  0: '草稿',
  1: '已审核',
  2: '已出入库',
  3: '已完成'
}

onMounted(() => {
  stats.value = {
    productCount: 156,
    orderCount: 89,
    customerCount: 45,
    alertCount: 3
  }
  recentPurchases.value = [
    { orderNo: 'PO20240115001', totalAmount: 12500, status: 3, createTime: '2024-01-15 10:30:00' },
    { orderNo: 'PO20240114002', totalAmount: 8600, status: 2, createTime: '2024-01-14 14:20:00' },
    { orderNo: 'PO20240113001', totalAmount: 23400, status: 1, createTime: '2024-01-13 09:15:00' }
  ]
  recentSales.value = [
    { orderNo: 'SO20240115001', totalAmount: 18900, status: 3, createTime: '2024-01-15 11:45:00' },
    { orderNo: 'SO20240114003', totalAmount: 5600, status: 2, createTime: '2024-01-14 16:30:00' },
    { orderNo: 'SO20240113002', totalAmount: 12300, status: 0, createTime: '2024-01-13 15:00:00' }
  ]
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
  justify-content: space-between;
}

.stat-info .stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-info .stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.product {
  background: linear-gradient(135deg, #409EFF, #66b1ff);
}

.stat-icon.order {
  background: linear-gradient(135deg, #67C23A, #85ce61);
}

.stat-icon.customer {
  background: linear-gradient(135deg, #E6A23C, #ebb563);
}

.stat-icon.alert {
  background: linear-gradient(135deg, #F56C6C, #f78989);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>