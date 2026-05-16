<template>
  <div class="page-container">
    <van-nav-bar title="卖家中心" />
    
    <div style="background: white; padding: 20px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center;">
        <van-icon name="user-circle-o" size="50" color="#1989fa" />
        <div style="margin-left: 16px;">
          <div style="font-size: 18px; font-weight: 500;">{{ user.nickname || user.username }}</div>
          <div style="color: #999; font-size: 14px;">ID: {{ user.id }}</div>
        </div>
      </div>
    </div>

    <van-tabs v-model:active="activeTab">
      <van-tab title="在售商品">
        <van-pull-refresh v-model="refreshing" @refresh="loadProducts">
          <div v-if="products.length > 0">
            <div
              v-for="product in products"
              :key="product.id"
              class="product-card"
              @click="goDetail(product.id)"
            >
              <img
                v-if="product.images && product.images.length > 0"
                :src="product.images[0]"
                class="product-image"
              />
              <div v-else class="product-image" style="background: #eee; display: flex; align-items: center; justify-content: center;">
                <van-icon name="photo-o" size="40" color="#ccc" />
              </div>
              <div class="product-info">
                <div class="product-title">{{ product.title }}</div>
                <div class="product-price">¥{{ product.price }}</div>
                <div class="product-meta">
                  <span :style="{ color: product.status === 'ON_SALE' ? '#07c160' : '#ff976a' }">
                    {{ product.status === 'ON_SALE' ? '在售' : '已售出' }}
                  </span>
                  <span>{{ product.viewCount }}浏览</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <van-icon name="shop-o" size="48" color="#ccc" />
            <p style="margin-top: 12px;">暂无发布商品</p>
          </div>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '../api'

const router = useRouter()
const activeTab = ref(0)
const refreshing = ref(false)
const products = ref([])
const user = JSON.parse(localStorage.getItem('user') || '{}')

const loadProducts = async () => {
  if (!user.id) {
    router.push('/login')
    return
  }
  try {
    const res = await productApi.getList({ sellerId: user.id })
    if (res.data.success) {
      products.value = res.data.data
    }
  } catch (e) {
    console.error(e)
  }
  refreshing.value = false
}

const goDetail = (id) => {
  router.push(`/product/${id}`)
}

onMounted(loadProducts)
</script>
