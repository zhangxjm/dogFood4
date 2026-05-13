<template>
  <div>
    <div class="page-header">
      <h1>首页概览</h1>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stats-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div class="number">{{ stats.wantToRead || 0 }}</div>
          <div class="label">想读</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
          <div class="number">{{ stats.reading || 0 }}</div>
          <div class="label">在读</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <div class="number">{{ stats.finished || 0 }}</div>
          <div class="label">已读</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <div class="number">{{ stats.abandoned || 0 }}</div>
          <div class="label">放弃</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 24px;">
      <el-col :span="12">
        <div class="card-container">
          <h3 style="margin-bottom: 16px;">
            <el-icon><Clock /></el-icon>
            <span style="margin-left: 8px;">最近在读</span>
          </h3>
          <el-empty v-if="readingBooks.length === 0" description="暂无正在读的书" />
          <el-card v-for="book in readingBooks.slice(0, 5)" :key="book.id" class="book-card" shadow="hover">
            <div style="display: flex; gap: 16px;">
              <div style="flex-shrink: 0;">
                <div v-if="book.coverUrl" class="book-cover" :style="{ width: '80px', height: '110px' }">
                  <img :src="book.coverUrl" :alt="book.title" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />
                </div>
                <div v-else class="book-cover-placeholder" :style="{ width: '80px', height: '110px' }">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">{{ book.title }}</div>
                <div style="color: #909399; font-size: 14px; margin-bottom: 8px;">{{ book.author || '未知作者' }}</div>
                <div style="margin-bottom: 8px;">
                  <span class="status-tag status-reading">在读</span>
                </div>
                <div v-if="book.totalPages && book.currentPage !== undefined" class="reading-progress">
                  <el-progress :percentage="Math.round((book.currentPage / book.totalPages) * 100)" :stroke-width="8" style="flex: 1;" />
                  <span>{{ book.currentPage }}/{{ book.totalPages }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card-container">
          <h3 style="margin-bottom: 16px;">
            <el-icon><Star /></el-icon>
            <span style="margin-left: 8px;">已完成</span>
          </h3>
          <el-empty v-if="finishedBooks.length === 0" description="暂无已完成的书" />
          <el-card v-for="book in finishedBooks.slice(0, 5)" :key="book.id" class="book-card" shadow="hover">
            <div style="display: flex; gap: 16px;">
              <div style="flex-shrink: 0;">
                <div v-if="book.coverUrl" class="book-cover" :style="{ width: '80px', height: '110px' }">
                  <img :src="book.coverUrl" :alt="book.title" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />
                </div>
                <div v-else class="book-cover-placeholder" :style="{ width: '80px', height: '110px' }">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">{{ book.title }}</div>
                <div style="color: #909399; font-size: 14px; margin-bottom: 8px;">{{ book.author || '未知作者' }}</div>
                <div style="margin-bottom: 8px;">
                  <span class="status-tag status-finished">已读</span>
                  <el-rate v-if="book.rating" :model-value="book.rating" disabled size="small" style="margin-left: 8px;" />
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { bookApi } from '@/api'

const stats = ref({})
const readingBooks = ref([])
const finishedBooks = ref([])

const fetchData = async () => {
  try {
    const [statsRes, readingRes, finishedRes] = await Promise.all([
      bookApi.getStats(),
      bookApi.getAll({ status: 'READING' }),
      bookApi.getAll({ status: 'FINISHED' })
    ])
    stats.value = statsRes.data
    readingBooks.value = readingRes.data
    finishedBooks.value = finishedRes.data
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>
