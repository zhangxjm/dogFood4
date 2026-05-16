<template>
  <div class="page-container" style="padding: 0;">
    <van-nav-bar title="商品详情" left-arrow @click-left="$router.back()" />
    
    <div v-if="product">
      <van-swipe :autoplay="3000" indicator-color="white">
        <van-swipe-item v-for="(img, index) in product.images" :key="index">
          <img :src="img" style="width: 100%; height: 300px; object-fit: cover;" />
        </van-swipe-item>
        <van-swipe-item v-if="!product.images || product.images.length === 0">
          <div style="width: 100%; height: 300px; background: #eee; display: flex; align-items: center; justify-content: center;">
            <van-icon name="photo-o" size="60" color="#ccc" />
          </div>
        </van-swipe-item>
      </van-swipe>

      <div style="padding: 16px; background: white;">
        <div style="font-size: 22px; color: #f56c6c; font-weight: bold;">
          ¥{{ product.price }}
        </div>
        <div style="font-size: 18px; margin-top: 12px; font-weight: 500;">
          {{ product.title }}
        </div>
        <div style="color: #666; margin-top: 8px; line-height: 1.6;">
          {{ product.description }}
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 16px; color: #999; font-size: 14px;">
          <span>分类: {{ product.category || '其他' }}</span>
          <span>{{ product.viewCount }}浏览</span>
          <span>{{ product.favoriteCount }}收藏</span>
        </div>
      </div>

      <div style="margin-top: 12px; padding: 16px; background: white; display: flex; align-items: center;">
        <van-icon name="user-circle-o" size="40" color="#1989fa" />
        <div style="margin-left: 12px;">
          <div style="font-weight: 500;">{{ product.sellerName }}</div>
          <div style="color: #999; font-size: 12px;">卖家</div>
        </div>
      </div>
    </div>

    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 12px 16px; display: flex; gap: 12px; box-shadow: 0 -2px 10px rgba(0,0,0,0.1);">
      <van-button type="default" size="large" style="flex: 1" @click="toggleFavorite">
        <van-icon :name="isFavorited ? 'star' : 'star-o'" color="#ff976a" />
        {{ isFavorited ? '已收藏' : '收藏' }}
      </van-button>
      <van-button
        type="primary"
        size="large"
        style="flex: 2"
        :disabled="product && product.status !== 'ON_SALE'"
        @click="handleBuy"
      >
        {{ product && product.status === 'ON_SALE' ? '立即购买' : '已售出' }}
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { productApi, favoriteApi, transactionApi } from '../api'

const router = useRouter()
const route = useRoute()
const product = ref(null)
const isFavorited = ref(false)
const user = JSON.parse(localStorage.getItem('user') || '{}')

const loadProduct = async () => {
  try {
    const res = await productApi.getById(route.params.id)
    if (res.data.success) {
      product.value = res.data.data
      checkFavorite()
    }
  } catch (e) {
    console.error(e)
  }
}

const checkFavorite = async () => {
  if (!user.id) return
  try {
    const res = await favoriteApi.check(user.id, route.params.id)
    if (res.data.success) {
      isFavorited.value = res.data.data
    }
  } catch (e) {
    console.error(e)
  }
}

const toggleFavorite = async () => {
  if (!user.id) {
    router.push('/login')
    return
  }
  try {
    if (isFavorited.value) {
      await favoriteApi.remove(user.id, route.params.id)
      isFavorited.value = false
      showToast('已取消收藏')
    } else {
      await favoriteApi.add(user.id, route.params.id)
      isFavorited.value = true
      showToast('收藏成功')
    }
  } catch (e) {
    showToast('操作失败')
  }
}

const handleBuy = async () => {
  if (!user.id) {
    router.push('/login')
    return
  }
  if (product.value.sellerId === user.id) {
    showToast('不能购买自己的商品')
    return
  }
  try {
    await showConfirmDialog({
      title: '确认购买',
      message: `确定以 ¥${product.value.price} 购买「${product.value.title}」吗？`
    })
    const res = await transactionApi.create(route.params.id, user.id)
    if (res.data.success) {
      showToast('购买成功')
      router.push('/transactions')
    } else {
      showToast(res.data.message)
    }
  } catch (e) {
    if (e !== 'cancel') {
      showToast('购买失败')
    }
  }
}

onMounted(loadProduct)
</script>
