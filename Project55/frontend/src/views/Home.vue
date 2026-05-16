<template>
  <div class="page-container">
    <van-nav-bar title="二手交易平台">
      <template #right>
        <van-icon name="user-o" size="20" @click="handleUser" />
      </template>
    </van-nav-bar>
    
    <van-search
      v-model="keyword"
      placeholder="搜索商品"
      @search="loadProducts"
    />
    
    <div style="margin: 12px 0;">
      <van-tabs v-model:active="activeCategory" @change="loadProducts">
        <van-tab title="全部" />
        <van-tab title="数码" />
        <van-tab title="服饰" />
        <van-tab title="图书" />
        <van-tab title="家居" />
        <van-tab title="其他" />
      </van-tabs>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
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
              <span>{{ product.sellerName }}</span>
              <span>{{ product.viewCount }}浏览</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <van-icon name="shopping-cart-o" size="48" />
        <p style="margin-top: 12px;">暂无商品</p>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '../api'

const router = useRouter()
const keyword = ref('')
const activeCategory = ref(0)
const refreshing = ref(false)
const products = ref([])

const categories = ['', '数码', '服饰', '图书', '家居', '其他']

const loadProducts = async () => {
  try {
    const category = categories[activeCategory.value]
    const res = await productApi.getList({
      keyword: keyword.value,
      category: category || undefined
    })
    if (res.data.success) {
      products.value = res.data.data
    }
  } catch (e) {
    console.error(e)
  }
  refreshing.value = false
}

const onRefresh = () => {
  loadProducts()
}

const goDetail = (id) => {
  router.push(`/product/${id}`)
}

const handleUser = () => {
  const user = localStorage.getItem('user')
  if (!user) {
    router.push('/login')
  }
}

onMounted(() => {
  const user = localStorage.getItem('user')
  if (!user) {
    router.push('/login')
    return
  }
  loadProducts()
})
</script>
