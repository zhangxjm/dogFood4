<template>
  <div>
    <h2 style="margin-bottom: 20px">数据统计</h2>
    
    <el-row :gutter="20" style="margin-bottom: 30px">
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="text-align: center">
            <el-icon size="40" color="#409EFF"><Reading /></el-icon>
            <div style="font-size: 32px; font-weight: bold; margin: 10px 0">{{ stats.totalBooks }}</div>
            <div style="color: #909399">图书总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="text-align: center">
            <el-icon size="40" color="#67C23A"><User /></el-icon>
            <div style="font-size: 32px; font-weight: bold; margin: 10px 0">{{ stats.totalReaders }}</div>
            <div style="color: #909399">读者总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="text-align: center">
            <el-icon size="40" color="#E6A23C"><Document /></el-icon>
            <div style="font-size: 32px; font-weight: bold; margin: 10px 0">{{ stats.borrowingCount }}</div>
            <div style="color: #909399">借阅中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="text-align: center">
            <el-icon size="40" color="#F56C6C"><Money /></el-icon>
            <div style="font-size: 32px; font-weight: bold; margin: 10px 0">¥{{ stats.totalFine.toFixed(2) }}</div>
            <div style="color: #909399">罚款总额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>借阅排行榜</span>
        </div>
      </template>
      <el-table :data="stats.bookRankings" style="width: 100%">
        <el-table-column prop="bookId" label="排名" width="80">
          <template #default="{ $index }">
            <el-tag v-if="$index === 0" type="danger" effect="dark">第1</el-tag>
            <el-tag v-else-if="$index === 1" type="warning" effect="dark">第2</el-tag>
            <el-tag v-else-if="$index === 2" type="success" effect="dark">第3</el-tag>
            <span v-else>第{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="书名" />
        <el-table-column prop="borrowCount" label="借阅次数" width="120">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.borrowCount }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStatistics } from '../api'
import { ElMessage } from 'element-plus'

const stats = ref({
  totalBooks: 0,
  totalReaders: 0,
  borrowingCount: 0,
  totalBorrowCount: 0,
  totalFine: 0,
  bookRankings: []
})

const loadStatistics = async () => {
  try {
    const res = await getStatistics()
    stats.value = res.data.data
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

onMounted(() => {
  loadStatistics()
})
</script>
