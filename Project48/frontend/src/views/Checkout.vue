<template>
  <div class="checkout-page">
    <div class="header">
      <van-button type="default" size="small" @click="$router.back()">返回</van-button>
      <h2>确认订单</h2>
      <div></div>
    </div>

    <div class="cart-items">
      <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
        <div class="item-info">
          <h4>{{ item.productName }}</h4>
          <p class="spec">{{ item.sugarLevel }} / {{ item.iceLevel }}</p>
          <p class="price">¥{{ item.price }}</p>
        </div>
        <div class="item-actions">
          <van-stepper v-model="item.quantity" :min="1" @change="updateQuantity(item.id, $event)" />
          <van-button type="danger" size="small" @click="removeItem(item.id)">删除</van-button>
        </div>
      </div>
      <van-empty v-if="cartStore.items.length === 0" description="购物车为空" />
    </div>

    <div class="payment-section" v-if="cartStore.items.length > 0">
      <h3>支付方式</h3>
      <van-radio-group v-model="paymentMethod">
        <van-cell-group>
          <van-cell title="现金支付" clickable @click="paymentMethod = 'CASH'">
            <template #right-icon>
              <van-radio name="CASH" />
            </template>
          </van-cell>
          <van-cell title="微信支付" clickable @click="paymentMethod = 'WECHAT'">
            <template #right-icon>
              <van-radio name="WECHAT" />
            </template>
          </van-cell>
          <van-cell title="支付宝支付" clickable @click="paymentMethod = 'ALIPAY'">
            <template #right-icon>
              <van-radio name="ALIPAY" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </div>

    <van-submit-bar
      :price="cartStore.totalAmount * 100"
      :disabled="cartStore.totalCount === 0 || !paymentMethod"
      button-text="确认支付"
      @submit="submitOrder"
      :loading="submitting"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { orderAPI } from '../api'
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'

const router = useRouter()
const cartStore = useCartStore()
const paymentMethod = ref('')
const submitting = ref(false)

const updateQuantity = (itemId, quantity) => {
  cartStore.updateQuantity(itemId, quantity)
}

const removeItem = (itemId) => {
  cartStore.removeItem(itemId)
}

const submitOrder = async () => {
  submitting.value = true
  try {
    const orderData = {
      totalAmount: cartStore.totalAmount,
      discountAmount: 0,
      payAmount: cartStore.totalAmount,
      paymentMethod: paymentMethod.value,
      remark: '',
      items: cartStore.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        sugarLevel: item.sugarLevel,
        iceLevel: item.iceLevel,
        remark: item.remark
      }))
    }

    const res = await orderAPI.create(orderData)
    cartStore.clearCart()
    showSuccessToast('支付成功！')
    router.push(`/receipt/${res.data.orderNo}`)
  } catch (e) {
    console.error('下单失败:', e)
    showFailToast('下单失败，请确保后端服务已启动')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout-page {
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

.cart-items {
  padding: 12px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
}

.item-info h4 {
  margin: 0 0 4px;
}

.item-info .spec {
  margin: 0 0 4px;
  font-size: 12px;
  color: #999;
}

.item-info .price {
  margin: 0;
  color: #f56c6c;
  font-weight: bold;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.payment-section {
  padding: 16px;
  background: white;
  margin: 12px;
  border-radius: 8px;
}

.payment-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
}
</style>
