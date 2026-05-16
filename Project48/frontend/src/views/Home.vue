<template>
  <div class="home-page">
    <div class="header">
      <h2>奶茶店收银系统</h2>
      <van-button type="primary" size="small" @click="$router.push('/report')">
        日结报表
      </van-button>
    </div>

    <div class="loading-container" v-if="loading">
      <van-loading size="24px" color="#1989fa">加载中...</van-loading>
    </div>

    <van-tabs v-model:active="activeCategory" sticky v-else>
      <van-tab v-for="cat in categories" :key="cat" :title="cat">
        <div class="product-list">
          <van-empty v-if="getProductsByCategory(cat).length === 0" description="暂无商品" />
          <van-card
            v-for="product in getProductsByCategory(cat)"
            :key="product.id"
            :title="product.name"
            :price="product.price"
            :thumb="getProductImage(product)"
            @click="openSpecPopup(product)"
          >
            <template #tags>
              <van-tag plain type="primary">{{ product.category }}</van-tag>
            </template>
          </van-card>
        </div>
      </van-tab>
    </van-tabs>

    <van-popup v-model:show="showSpecPopup" position="bottom" round>
      <div class="spec-popup">
        <h3>{{ selectedProduct?.name }}</h3>
        <p class="price">¥{{ selectedProduct?.price }}</p>
        
        <div class="spec-section">
          <h4>糖度</h4>
          <van-radio-group v-model="sugarLevel" direction="horizontal">
            <van-radio name="无糖">无糖</van-radio>
            <van-radio name="少糖">少糖</van-radio>
            <van-radio name="半糖">半糖</van-radio>
            <van-radio name="正常糖">正常糖</van-radio>
          </van-radio-group>
        </div>

        <div class="spec-section">
          <h4>冰度</h4>
          <van-radio-group v-model="iceLevel" direction="horizontal">
            <van-radio name="去冰">去冰</van-radio>
            <van-radio name="少冰">少冰</van-radio>
            <van-radio name="正常冰">正常冰</van-radio>
            <van-radio name="热饮">热饮</van-radio>
          </van-radio-group>
        </div>

        <div class="popup-actions">
          <van-button type="default" @click="showSpecPopup = false">取消</van-button>
          <van-button type="primary" @click="addToCart">加入购物车</van-button>
        </div>
      </div>
    </van-popup>

    <van-submit-bar
      :price="cartStore.totalAmount * 100"
      :disabled="cartStore.totalCount === 0"
      button-text="去结算"
      @submit="$router.push('/checkout')"
    >
      <template #left>
        <div class="cart-info">
          <span>已选 {{ cartStore.totalCount }} 件</span>
        </div>
      </template>
    </van-submit-bar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { productAPI } from '../api'
import { showToast, showSuccessToast, showFailToast } from 'vant'

const cartStore = useCartStore()
const products = ref([])
const activeCategory = ref('奶茶')
const showSpecPopup = ref(false)
const selectedProduct = ref(null)
const sugarLevel = ref('正常糖')
const iceLevel = ref('正常冰')
const loading = ref(true)

const categories = ['奶茶', '果茶', '奶盖', '咖啡']

const getProductsByCategory = (category) => {
  return products.value.filter(p => p.category === category)
}

const getProductImage = (product) => {
  const images = {
    '奶茶': 'https://images.unsplash.com/photo-1558857564-b352c35d95d5?w=200&h=200&fit=crop',
    '果茶': 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=200&h=200&fit=crop',
    '奶盖': 'https://images.unsplash.com/photo-1514432324119-5331a52875df?w=200&h=200&fit=crop',
    '咖啡': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop'
  }
  return images[product.category] || images['奶茶']
}

const openSpecPopup = (product) => {
  selectedProduct.value = product
  sugarLevel.value = '正常糖'
  iceLevel.value = '正常冰'
  showSpecPopup.value = true
}

const addToCart = () => {
  if (selectedProduct.value) {
    cartStore.addItem(selectedProduct.value, sugarLevel.value, iceLevel.value)
    showSuccessToast('已加入购物车')
    showSpecPopup.value = false
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await productAPI.getAll()
    products.value = res.data
    if (products.value.length === 0) {
      showToast('暂无商品数据，请检查后端服务')
    }
  } catch (e) {
    console.error('加载商品失败', e)
    showFailToast('加载商品失败，请确保后端服务已启动')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.home-page {
  padding-bottom: 100px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
}

.header h2 {
  margin: 0;
  font-size: 18px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.product-list {
  padding: 12px;
}

.product-list .van-card {
  margin-bottom: 12px;
}

.spec-popup {
  padding: 20px;
}

.spec-popup h3 {
  margin: 0 0 8px;
}

.spec-popup .price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 20px;
}

.spec-section {
  margin-bottom: 20px;
}

.spec-section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #666;
}

.popup-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.popup-actions .van-button {
  flex: 1;
}

.cart-info {
  font-size: 14px;
  color: #333;
}
</style>
