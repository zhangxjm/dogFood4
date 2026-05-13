<template>
  <div class="item-detail-page">
    <button class="back-btn" @click="$router.back()">
      ← 返回列表
    </button>

    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else-if="item" class="detail-card">
      <div class="detail-header">
        <h2>{{ item.title }}</h2>
        <div class="status-badge">
          <span
            class="badge"
            :class="statusClass"
          >
            {{ statusText }}
          </span>
        </div>
      </div>

      <div class="detail-content">
        <div class="detail-image">
          <img
            v-if="item.image_url"
            :src="item.image_url"
            :alt="item.title"
          />
          <div v-else class="no-image">
            <span>暂无图片</span>
          </div>
        </div>

        <div class="detail-info">
          <p class="price">¥{{ item.price.toFixed(2) }}</p>
          
          <div class="info-section">
            <h4>分类</h4>
            <p>{{ item.category_name }}</p>
          </div>

          <div class="info-section">
            <h4>物品描述</h4>
            <p class="description">{{ item.description }}</p>
          </div>

          <div class="info-section">
            <h4>卖家信息</h4>
            <p><strong>姓名：</strong>{{ item.seller_name }}</p>
            <p><strong>联系方式：</strong>{{ item.contact }}</p>
          </div>

          <div class="info-section">
            <h4>发布时间</h4>
            <p>{{ item.created_at }}</p>
          </div>

          <div class="action-buttons" v-if="item.status === 'available'">
            <button class="btn btn-primary" @click="$router.push(`/edit/${item.id}`)">
              编辑物品
            </button>
            <button class="btn btn-warning" @click="handleOffline">
              下架物品
            </button>
            <button class="btn btn-danger" @click="handleDelete">
              删除物品
            </button>
          </div>

          <div class="action-buttons" v-else>
            <button class="btn btn-success" @click="handleOnline" v-if="item.status === 'offline'">
              重新上架
            </button>
            <button class="btn btn-primary" @click="$router.push(`/edit/${item.id}`)">
              编辑物品
            </button>
            <button class="btn btn-danger" @click="handleDelete">
              删除物品
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getItem, updateItemStatus, deleteItem } from '../api'

const route = useRoute()
const router = useRouter()

const item = ref(null)
const loading = ref(true)
const error = ref(null)

const statusText = computed(() => {
  const statusMap = {
    'available': '在售',
    'sold': '已售出',
    'offline': '已下架'
  }
  return statusMap[item.value?.status] || '未知'
})

const statusClass = computed(() => {
  const classMap = {
    'available': 'badge-success',
    'sold': 'badge-warning',
    'offline': 'badge-danger'
  }
  return classMap[item.value?.status] || ''
})

const loadItem = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getItem(route.params.id)
    item.value = res.data
  } catch (err) {
    console.error('加载物品失败:', err)
    error.value = '加载物品失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const handleOffline = async () => {
  if (!confirm('确定要下架此物品吗？')) return
  
  try {
    await updateItemStatus(route.params.id, 'offline')
    alert('物品已下架')
    loadItem()
  } catch (err) {
    console.error('下架物品失败:', err)
    alert('下架物品失败，请稍后重试')
  }
}

const handleOnline = async () => {
  try {
    await updateItemStatus(route.params.id, 'available')
    alert('物品已重新上架')
    loadItem()
  } catch (err) {
    console.error('上架物品失败:', err)
    alert('上架物品失败，请稍后重试')
  }
}

const handleDelete = async () => {
  if (!confirm('确定要删除此物品吗？此操作不可恢复！')) return
  
  try {
    await deleteItem(route.params.id)
    alert('物品已删除')
    router.push('/')
  } catch (err) {
    console.error('删除物品失败:', err)
    alert('删除物品失败，请稍后重试')
  }
}

onMounted(() => {
  loadItem()
})
</script>

<style scoped>
.item-detail-page {
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
}

.back-btn:hover {
  text-decoration: underline;
}

.detail-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.detail-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-header h2 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.detail-image {
  width: 100%;
  min-height: 300px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #999;
  font-size: 1rem;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.price {
  font-size: 2.5rem;
  font-weight: bold;
  color: #e74c3c;
  margin: 0;
}

.info-section {
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.info-section h4 {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.info-section p {
  color: #333;
  line-height: 1.6;
  margin: 0.3rem 0;
}

.description {
  white-space: pre-wrap;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .detail-content {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
  
  .detail-image {
    min-height: 250px;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
