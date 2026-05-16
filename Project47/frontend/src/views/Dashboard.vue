<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon blue">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalStudents || 0 }}</div>
              <div class="stat-label">总学员数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon green">
              <el-icon><Avatar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCoaches || 0 }}</div>
              <div class="stat-label">教练总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon orange">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.studyingStudents || 0 }}</div>
              <div class="stat-label">学习中学员</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon purple">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.graduatedStudents || 0 }}</div>
              <div class="stat-label">已毕业学员</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card title="今日预约">
          <div class="chart-container">
            <p style="text-align: center; font-size: 48px; color: #409eff;">{{ stats.todayReservations || 0 }}</p>
            <p style="text-align: center; color: #909399;">今日预约总数</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="快捷操作">
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/students')" size="large">
              <el-icon><Plus /></el-icon>
              新增学员
            </el-button>
            <el-button type="success" @click="$router.push('/reservations')" size="large">
              <el-icon><Calendar /></el-icon>
              预约管理
            </el-button>
            <el-button type="warning" @click="$router.push('/study-hours')" size="large">
              <el-icon><Clock /></el-icon>
              学时记录
            </el-button>
            <el-button type="info" @click="$router.push('/statistics')" size="large">
              <el-icon><TrendCharts /></el-icon>
              查看报表
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { statisticsApi } from '../api'

const stats = ref({})

const loadData = async () => {
  try {
    const data = await statisticsApi.dashboard()
    stats.value = data
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stat-card {
  border: none;
}
.stat-content {
  display: flex;
  align-items: center;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 28px;
  color: white;
}
.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}
.stat-icon.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.stat-icon.purple {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
  margin-top: 5px;
}
.chart-container {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
