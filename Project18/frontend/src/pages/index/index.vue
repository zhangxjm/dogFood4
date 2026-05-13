<template>
  <view class="container">
    <view class="header">
      <text class="title">甜蜜时光奶茶店</text>
      <text class="subtitle">选一杯你喜欢的饮品吧！</text>
    </view>

    <view class="category-tabs">
      <view 
        v-for="cat in categories" 
        :key="cat.id" 
        :class="['tab-item', currentCategory === cat.id ? 'active' : '']"
        @click="selectCategory(cat.id)"
      >
        <text>{{ cat.name }}</text>
      </view>
    </view>

    <view class="product-list">
      <view 
        v-for="product in filteredProducts" 
        :key="product.id" 
        class="product-card"
      >
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-desc">{{ product.description }}</text>
          <text class="product-price">¥{{ product.price }}</text>
        </view>
        <view class="product-action">
          <view v-if="getCartCount(product.id) > 0" class="quantity-control">
            <view class="qty-btn" @click="decreaseQuantity(product)">
              <text>-</text>
            </view>
            <text class="qty-text">{{ getCartCount(product.id) }}</text>
          </view>
          <view class="add-btn" @click="addToCart(product)">
            <text>+</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="cartCount > 0" class="cart-bar" @click="goToCart">
      <view class="cart-info">
        <text class="cart-icon">🛒</text>
        <text class="cart-badge">{{ cartCount }}</text>
      </view>
      <view class="cart-summary">
        <text class="cart-total">¥{{ cartTotal.toFixed(2) }}</text>
      </view>
      <view class="go-cart-btn">
        <text>去购物车</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getCategories, getProducts } from '@/utils/api'
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      categories: [],
      products: [],
      currentCategory: null,
      loading: false
    }
  },
  computed: {
    ...mapGetters(['cartItems', 'cartCount', 'cartTotal']),
    filteredProducts() {
      if (!this.currentCategory) {
        return this.products
      }
      return this.products.filter(p => p.category_id === this.currentCategory)
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    ...mapActions(['addToCart', 'increaseQuantity', 'decreaseQuantity']),
    async loadData() {
      this.loading = true
      try {
        const [catRes, prodRes] = await Promise.all([
          getCategories(),
          getProducts()
        ])
        this.categories = catRes.data
        this.products = prodRes.data
      } catch (error) {
        console.error('加载数据失败:', error)
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    selectCategory(categoryId) {
      if (this.currentCategory === categoryId) {
        this.currentCategory = null
      } else {
        this.currentCategory = categoryId
      }
    },
    getCartCount(productId) {
      const item = this.cartItems.find(i => i.id === productId)
      return item ? item.quantity : 0
    },
    goToCart() {
      uni.switchTab({
        url: '/pages/cart/cart'
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding-bottom: 80rpx;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.header {
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.category-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx 10rpx;
  overflow-x: auto;
  white-space: nowrap;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex-shrink: 0;
  padding: 15rpx 30rpx;
  margin: 0 10rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
}

.tab-item text {
  font-size: 28rpx;
  color: #666;
}

.tab-item.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
}

.tab-item.active text {
  color: #fff;
}

.product-list {
  padding: 20rpx;
}

.product-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.product-info {
  flex: 1;
  padding-right: 20rpx;
}

.product-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.product-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 15rpx;
}

.product-price {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.product-action {
  display: flex;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}

.qty-btn {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
}

.qty-btn text {
  font-size: 36rpx;
  color: #666;
}

.qty-text {
  font-size: 32rpx;
  font-weight: bold;
  margin: 0 20rpx;
  color: #333;
  min-width: 40rpx;
  text-align: center;
}

.add-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  border-radius: 50%;
  box-shadow: 0 4rpx 10rpx rgba(255, 107, 107, 0.4);
}

.add-btn text {
  font-size: 40rpx;
  color: #fff;
}

.cart-bar {
  position: fixed;
  bottom: 120rpx;
  left: 20rpx;
  right: 20rpx;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 20rpx 30rpx;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.15);
}

.cart-info {
  position: relative;
  padding: 10rpx;
}

.cart-icon {
  font-size: 50rpx;
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ff6b6b;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  min-width: 30rpx;
  text-align: center;
}

.cart-summary {
  flex: 1;
  padding-left: 20rpx;
}

.cart-total {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.go-cart-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  padding: 15rpx 35rpx;
  border-radius: 30rpx;
}

.go-cart-btn text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}
</style>
