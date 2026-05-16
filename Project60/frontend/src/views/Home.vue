<template>
  <div class="home-page">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="page-container">
        <h2 class="page-title">📊 数据统计</h2>
        
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item>
            <div class="stat-card student">
              <div class="stat-icon">👦</div>
              <div class="stat-value">{{ statistics.total_students || 0 }}</div>
              <div class="stat-label">学员总数</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card course">
              <div class="stat-icon">📚</div>
              <div class="stat-value">{{ statistics.total_courses || 0 }}</div>
              <div class="stat-label">课程总数</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card teacher">
              <div class="stat-icon">👨‍🏫</div>
              <div class="stat-value">{{ statistics.total_teachers || 0 }}</div>
              <div class="stat-label">老师总数</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card class">
              <div class="stat-icon">🏫</div>
              <div class="stat-value">{{ statistics.total_classes || 0 }}</div>
              <div class="stat-label">班级总数</div>
            </div>
          </van-grid-item>
        </van-grid>

        <div class="section">
          <h3 class="section-title">💰 营收统计</h3>
          <div class="revenue-card">
            <div class="revenue-value">¥{{ statistics.total_payments || 0 }}</div>
            <div class="revenue-label">累计收费</div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">📋 班级人数统计</h3>
          <van-cell-group>
            <van-cell
              v-for="cls in statistics.class_statistics || []"
              :key="cls.id"
              :title="cls.name"
            >
              <template #value>
                <van-tag :type="cls.current_students >= cls.max_students ? 'danger' : 'success'">
                  {{ cls.current_students }}/{{ cls.max_students }}人
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>
        </div>

        <div class="section">
          <van-button type="primary" block @click="$router.push('/teachers')">
            老师管理
          </van-button>
          <van-button type="warning" block style="margin-top: 12px" @click="$router.push('/payments')">
            缴费记录
          </van-button>
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStatistics } from '../api'

const refreshing = ref(false)
const statistics = ref({})

const loadData = async () => {
  try {
    const res = await getStatistics()
    statistics.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const onRefresh = async () => {
  await loadData()
  refreshing.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stat-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.stat-card.student {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card.course {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-card.teacher {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-card.class {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.revenue-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
  color: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
}

.revenue-value {
  font-size: 36px;
  font-weight: bold;
}

.revenue-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 8px;
}
</style>
