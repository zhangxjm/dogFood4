<template>
  <view class="container">
    <view v-if="cartItems.length === 0" class="empty-cart">
      <text class="empty-icon">🛒</text>
      <text class="empty-text">购物车是空的</text>
      <text class="empty-hint">去菜单页看看有什么好喝的吧~</text>
      <view class="go-menu-btn" @click="goToMenu">
        <text>去点单</text>
      </view>
    </view>

    <view v-else class="cart-content">
      <view class="cart-header">
        <text class="cart-title">购物车</text>
        <text class="clear-btn" @click="clearCart">清空购物车</text>
      </view>

      <view class="cart-list">
        <view 
          v-for="item in cartItems" 
          :key="item.id" 
          class="cart-item"
        >
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-price">¥{{ item.price }}</text>
          </view>
          <view class="item-action">
            <view class="qty-btn" @click="decreaseQuantity(item.id)">
              <text>-</text>
            </view>
            <text class="qty-text">{{ item.quantity }}</text>
            <view class="qty-btn" @click="increaseQuantity(item.id)">
              <text>+</text>
            </view>
          </view>
        </view>
      </view>

      <view class="remark-section">
        <text class="remark-label">备注（可选）</text>
        <textarea 
          class="remark-input" 
          v-model="remark" 
          placeholder="请输入备注，如：少糖、去冰等"
          maxlength="100"
        ></textarea>
      </view>

      <view class="checkout-bar">
        <view class="checkout-info">
          <text class="total-label">合计：</text>
          <text class="total-price">¥{{ cartTotal.toFixed(2) }}</text>
        </view>
        <view class="checkout-btn" :class="{ disabled: submitting }" @click="submitOrder">
          <text>{{ submitting ? '下单中...' : '提交订单' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { createOrder } from '@/utils/api'
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      remark: '',
      submitting: false
    }
  },
  computed: {
    ...mapGetters(['cartItems', 'cartCount', 'cartTotal'])
  },
  methods: {
    ...mapActions(['increaseQuantity', 'decreaseQuantity', 'clearCart']),
    goToMenu() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    async submitOrder() {
      if (this.submitting) return
      
      if (this.cartItems.length === 0) {
        uni.showToast({
          title: '购物车是空的',
          icon: 'none'
        })
        return
      }

      this.submitting = true
      try {
        const items = this.cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))

        const result = await createOrder({
          items,
          remark: this.remark
        })

        uni.showToast({
          title: '下单成功！',
          icon: 'success'
        })

        this.clearCart()
        this.remark = ''

        setTimeout(() => {
          uni.switchTab({
            url: '/pages/orders/orders'
          })
        }, 1500)
      } catch (error) {
        console.error('下单失败:', error)
        uni.showToast({
          title: error.message || '下单失败',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 60rpx;
}

.empty-icon {
  font-size: 160rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 36rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.empty-hint {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 50rpx;
}

.go-menu-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  padding: 25rpx 80rpx;
  border-radius: 50rpx;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.4);
}

.go-menu-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.cart-content {
  padding-bottom: 160rpx;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
}

.cart-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.clear-btn {
  font-size: 28rpx;
  color: #ff6b6b;
}

.cart-list {
  margin: 20rpx;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 30rpx;
  margin-bottom: 15rpx;
  border-radius: 20rpx;
}

.item-info {
  flex: 1;
}

.item-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.item-price {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.item-action {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
}

.qty-btn text {
  font-size: 40rpx;
  color: #666;
}

.qty-text {
  font-size: 32rpx;
  font-weight: bold;
  margin: 0 30rpx;
  color: #333;
  min-width: 50rpx;
  text-align: center;
}

.remark-section {
  margin: 20rpx;
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
}

.remark-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.remark-input {
  width: 100%;
  height: 150rpx;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 15rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.checkout-bar {
  position: fixed;
  bottom: 120rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 25rpx 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.checkout-info {
  display: flex;
  align-items: center;
}

.total-label {
  font-size: 28rpx;
  color: #666;
}

.total-price {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.checkout-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
}

.checkout-btn.disabled {
  opacity: 0.7;
}

.checkout-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
