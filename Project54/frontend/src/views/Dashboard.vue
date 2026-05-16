<template>
  <div>
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="text-align: center">
            <el-icon size="40" color="#409eff"><DataAnalysis /></el-icon>
            <div style="font-size: 30px; font-weight: bold; margin: 10px 0">{{ statistics.totalReservations }}</div>
            <div style="color: #909399">总预约数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="text-align: center">
            <el-icon size="40" color="#e6a23c"><Clock /></el-icon>
            <div style="font-size: 30px; font-weight: bold; margin: 10px 0">{{ statistics.pendingCount }}</div>
            <div style="color: #909399">待确认</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="text-align: center">
            <el-icon size="40" color="#67c23a"><Reading /></el-icon>
            <div style="font-size: 30px; font-weight: bold; margin: 10px 0">{{ statistics.completedCount }}</div>
            <div style="color: #909399">已完成</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="text-align: center">
            <el-icon size="40" color="#f56c6c"><Wallet /></el-icon>
            <div style="font-size: 30px; font-weight: bold; margin: 10px 0">¥{{ statistics.totalRevenue.toFixed(2) }}</div>
            <div style="color: #909399">总收入</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>月度统计</span>
              <el-tag type="success">近12个月</el-tag>
            </div>
          </template>
          <el-table :data="statistics.monthlyReservations" style="width: 100%">
            <el-table-column prop="month" label="月份" width="120" />
            <el-table-column prop="count" label="预约数" width="120">
              <template #default="{ row }">
                <el-tag type="info">{{ row.count }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="revenue" label="收入">
              <template #default="{ row }">
                <span style="color: #67c23a; font-weight: bold">¥{{ row.revenue.toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>服务评分</span>
              <el-rate v-model="statistics.averageRating" disabled show-score />
            </div>
          </template>
          <div style="text-align: center; padding: 40px 0">
            <div style="font-size: 60px; font-weight: bold; color: #409eff">
              {{ statistics.averageRating.toFixed(1) }}
            </div>
            <div style="color: #909399; margin-top: 10px">平均评分</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { statisticsAPI } from '../api'
import { DataAnalysis, Clock, Reading, Wallet } from '@element-plus/icons-vue'

const statistics = reactive({
  totalReservations: 0,
  pendingCount: 0,
  inProgressCount: 0,
  completedCount: 0,
  totalRevenue: 0,
  averageRating: 0,
  monthlyReservations: []
})

const loadStatistics = async () => {
  try {
    const response = await statisticsAPI.get()
    Object.assign(statistics, response.data.data)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStatistics()
})
</script>
