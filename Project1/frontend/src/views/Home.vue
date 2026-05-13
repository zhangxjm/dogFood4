<template>
  <div class="home-page page-container">
    <van-search
      v-model="search"
      placeholder="搜索商品"
      @search="handleSearch"
      @cancel="handleCancel"
      show-action
    />
    
    <div class="banner">
      <div class="banner-content">
        <h3>社区团购</h3>
        <p>团购更省钱，品质有保障</p>
      </div>
    </div>
    
    <van-tabs v-model:active="activeCategory" sticky @change="handleCategoryChange">
      <van-tab title="全部" />
      <van-tab v-for="cat in categories" :key="cat.id" :title="cat.name" />
    </van-tabs>
    
    <div class="product-list">
      <van-loading v-if="loading" class="loading" />
      <van-empty v-else-if="products.length === 0" description="暂无商品" />
      <van-card
        v-for="product in products"
        :key="product.id"
        :thumb="product.image || 'https://fastly.jsdelivr.net/npm/@vant/assets/leaf.jpeg'"
        :title="product.name"
        :price="product.group_price"
        :origin-price="product.original_price"
        @click="goDetail(product.id)"
      >
        <template #footer>
          <div class="product-footer">
            <span class="sold">已售{{ product.sold_count || 0 }}件</span>
            <van-button size="mini" type="primary" @click.stop="buyNow(product)">
              立即购买
            </van-button>
          </div>
        </template>
      </van-card>
    </div>
    
    <Tabbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPublicProducts, getCategories } from '@/api/products'
import { getPublicPickupPoints } from '@/api/pickup'
import { useCartStore } from '@/stores/cart'
import Tabbar from '@/components/Tabbar.vue'

const router = useRouter()
const cartStore = useCartStore()

const search = ref('')
const activeCategory = ref(0)
const categories = ref([])
const products = ref([])
const pickupPoints = ref([])
const loading = ref(false)

onMounted(() => {
  fetchCategories()
  fetchProducts()
  fetchPickupPoints()
})

async function fetchCategories() {
  try {
    const res = await getCategories()
    categories.value = res
  } catch (e) {
    console.error(e)
  }
}

async function fetchProducts() {
  loading.value = true
  try {
    const res = await getPublicProducts({ search: search.value })
    products.value = res.results || res
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchPickupPoints() {
  try {
    const res = await getPublicPickupPoints()
    pickupPoints.value = res
  } catch (e) {
    console.error(e)
  }
}

function handleSearch(value) {
  fetchProducts()
}

function handleCancel() {
  search.value = ''
  fetchProducts()
}

function handleCategoryChange(index) {
  fetchProducts()
}

function goDetail(id) {
  router.push(`/product/${id}`)
}

function buyNow(product) {
  if (pickupPoints.value.length === 0) {
    router.push(`/product/${product.id}`)
    return
  }
  router.push({
    path: '/checkout',
    query: { productId: product.id, quantity: 1 }
  })
}
</script>

<style scoped lang="less">
.home-page {
  background: #f7f8fa;
}

.banner {
  margin: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #1989fa 0%, #5fb7ff 100%);
  border-radius: 12px;
  color: #fff;
  
  h3 {
    margin: 0 0 4px;
    font-size: 20px;
  }
  p {
    margin: 0;
    font-size: 13px;
    opacity: 0.9;
  }
}

.product-list {
  padding: 12px;
}

.loading {
  text-align: center;
  padding: 40px 0;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .sold {
    font-size: 12px;
    color: #969799;
  }
}
</style>
