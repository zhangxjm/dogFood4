<template>
  <div class="page-container">
    <van-nav-bar title="我的收藏" />
    
    <van-pull-refresh v-model="refreshing" @refresh="loadFavorites">
      <div v-if="favorites.length > 0">
        <div
          v-for="product in favorites"
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
              <span>{{ product.sellerName }}</span>
              <span>{{ product.viewCount }}浏览</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <van-icon name="star-o" size="48" color="#ccc" />
        <p style="margin-top: 12px;">暂无收藏商品</p>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { favoriteApi } from '../api'

const router = useRouter()
const refreshing = ref(false)
const favorites = ref([])
const user = JSON.parse(localStorage.getItem('user') || '{}')

const loadFavorites = async () => {
  if (!user.id) {
    router.push('/login')
    return
  }
  try {
    const res = await favoriteApi.getByUser(user.id)
    if (res.data.success) {
      favorites.value = res.data.data
    }
  } catch (e) {
    console.error(e)
  }
  refreshing.value = false
}

const goDetail = (id) => {
  router.push(`/product/${id}`)
}

onMounted(loadFavorites)
</script>
