<template>
  <div class="item-list-page">
    <div class="page-header">
      <h2>闲置物品列表</h2>
      <button class="btn btn-primary" @click="$router.push('/add')">
        + 发布新物品
      </button>
    </div>

    <div class="filter-section">
      <div class="category-filters">
        <button
          class="category-btn"
          :class="{ active: !selectedCategory }"
          @click="selectedCategory = null"
        >
          全部
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="category-btn"
          :class="{ active: selectedCategory === cat.id }"
          @click="selectedCategory = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else-if="items.length === 0" class="empty-state">
      <h3>暂无物品</h3>
      <p>还没有发布任何闲置物品，快来发布第一个吧！</p>
      <button class="btn btn-primary" @click="$router.push('/add')">
        发布物品
      </button>
    </div>
    
    <div v-else class="items-grid">
      <div
        v-for="item in items"
        :key="item.id"
        class="card item-card"
        @click="$router.push(`/item/${item.id}`)"
      >
        <div class="item-image">
          <img
            v-if="item.image_url"
            :src="item.image_url"
            :alt="item.title"
          />
          <div v-else class="no-image">
            <span>暂无图片</span>
          </div>
        </div>
        <div class="item-info">
          <h3 class="item-title">{{ item.title }}</h3>
          <p class="item-price">¥{{ item.price.toFixed(2) }}</p>
          <div class="item-meta">
            <span class="badge badge-success">{{ item.category_name }}</span>
            <span class="seller">{{ item.seller_name }}</span>
          </div>
          <p class="item-date">{{ item.created_at }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getCategories, getItems } from '../api'

const categories = ref([])
const items = ref([])
const selectedCategory = ref(null)
const loading = ref(false)
const error = ref(null)

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data
  } catch (err) {
    console.error('加载分类失败:', err)
  }
}

const loadItems = async () => {
  loading.value = true
  error.value = null
  try {
    const params = { status: 'available' }
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }
    const res = await getItems(params)
    items.value = res.data
  } catch (err) {
    console.error('加载物品失败:', err)
    error.value = '加载物品失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

watch(selectedCategory, () => {
  loadItems()
})

onMounted(() => {
  loadCategories()
  loadItems()
})
</script>

<style scoped>
.item-list-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.8rem;
  color: #333;
}

.filter-section {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.category-filters {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.6rem 1.2rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 20px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.category-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.item-card {
  cursor: pointer;
}

.item-image {
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.9rem;
}

.item-info {
  padding: 1rem;
}

.item-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 1.4rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 0.8rem;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.seller {
  font-size: 0.9rem;
  color: #666;
}

.item-date {
  font-size: 0.8rem;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}
</style>
