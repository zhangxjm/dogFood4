<template>
  <div class="statistics">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon blue">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalStudents || 0 }}</div>
            <div class="stat-label">总学员数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon green">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.studyingStudents || 0 }}</div>
            <div class="stat-label">学习中学员</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon orange">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.graduatedStudents || 0 }}</div>
            <div class="stat-label">已毕业学员</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon purple">
            <el-icon><Avatar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalCoaches || 0 }}</div>
            <div class="stat-label">教练总数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card title="各科目通过率">
          <el-table :data="passRateData" stripe>
            <el-table-column prop="subject" label="科目">
              <template #default="{ row }">
                科目{{ row.subject }}
              </template>
            </el-table-column>
            <el-table-column prop="total" label="考试人数" />
            <el-table-column prop="passed" label="通过人数" />
            <el-table-column prop="rate" label="通过率">
              <template #default="{ row }">
                <el-tag :type="row.rate >= 80 ? 'success' : row.rate >= 60 ? 'warning' : 'danger'">
                  {{ row.rate.toFixed(1) }}%
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="各科目平均成绩">
          <el-table :data="subjectStats" stripe>
            <el-table-column prop="subject" label="科目">
              <template #default="{ row }">
                科目{{ row.subject }}
              </template>
            </el-table-column>
            <el-table-column prop="count" label="考试次数" />
            <el-table-column prop="avgScore" label="平均成绩">
              <template #default="{ row }">
                <el-tag type="primary">
                  {{ row.avgScore.toFixed(1) }}分
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card title="今日预约">
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; color: #409eff; font-weight: bold;">
              {{ stats.todayReservations || 0 }}
            </div>
            <div style="color: #909399; margin-top: 10px;">今日预约总数</div>
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
const passRateData = ref([])
const subjectStats = ref([])

const loadData = async () => {
  try {
    const dashboardData = await statisticsApi.dashboard()
    stats.value = dashboardData
    subjectStats.value = dashboardData.subjectStats || []

    const passRate = await statisticsApi.passRate()
    passRateData.value = passRate || []
  } catch (error) {
    console.error('加载统计数据失败:', error)
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
  float: left;
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
  overflow: hidden;
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
</style>
