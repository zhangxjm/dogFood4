<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">技师管理</div>
      <div style="font-size: 12px; opacity: 0.9; margin-top: 4px">管理理发店技师信息</div>
    </div>
    
    <div class="page-content">
      <van-search
        v-model="keyword"
        placeholder="搜索技师姓名、电话、职位"
        :show-action="false"
        @search="loadTechnicians"
        @change="onKeywordChange"
        style="margin-bottom: 12px"
      />
      
      <van-tabs v-model:active="activeTab" sticky @change="loadTechnicians">
        <van-tab title="全部" />
        <van-tab title="在职" />
        <van-tab title="离职" />
      </van-tabs>
      
      <div v-if="loading" style="padding: 40px; text-align: center">
        <van-loading type="spinner" color="#1989fa" />
      </div>
      
      <div v-else-if="technicians.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <div>暂无技师数据</div>
        <div style="font-size: 12px; margin-top: 8px">点击右下角按钮添加技师</div>
      </div>
      
      <div v-else style="margin-top: 12px">
        <div
          v-for="tech in technicians"
          :key="tech.id"
          class="tech-card"
          @click="editTech(tech.id)"
        >
          <div class="tech-avatar">{{ tech.name.charAt(0) }}</div>
          <div class="tech-info">
            <div class="tech-name">
              {{ tech.name }}
              <span
                v-if="tech.status"
                :class="['status-tag', 'status-' + tech.status]"
                style="margin-left: 8px"
              >
                {{ tech.status_display }}
              </span>
            </div>
            <div class="tech-meta">
              <span v-if="tech.gender_display">{{ tech.gender_display }}</span>
              <span v-if="tech.phone">{{ tech.phone }}</span>
              <span v-if="tech.position">{{ tech.position }}</span>
            </div>
            <div v-if="tech.skills" style="font-size: 12px; color: #969799; margin-top: 4px">
              擅长：{{ tech.skills }}
            </div>
          </div>
          <van-icon name="arrow" />
        </div>
      </div>
    </div>
    
    <van-fab
      icon="plus"
      v-model:show="showFab"
      @click="addTech"
      style="right: 20px; bottom: 80px"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { technicianApi } from '../api'

const router = useRouter()
const loading = ref(false)
const keyword = ref('')
const activeTab = ref(0)
const technicians = ref([])
const showFab = ref(true)

let searchTimer = null

const getStatusFilter = () => {
  if (activeTab.value === 1) return 'active'
  if (activeTab.value === 2) return 'inactive'
  return ''
}

const loadTechnicians = async () => {
  loading.value = true
  try {
    const params = {}
    if (keyword.value) params.keyword = keyword.value
    const status = getStatusFilter()
    if (status) params.status = status
    
    const res = await technicianApi.list(params)
    technicians.value = res.data.results || res.data
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const onKeywordChange = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadTechnicians()
  }, 300)
}

const addTech = () => {
  router.push('/technicians/new')
}

const editTech = (id) => {
  router.push(`/technicians/${id}`)
}

onMounted(() => {
  loadTechnicians()
})
</script>
