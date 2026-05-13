<template>
  <div class="cart-page">
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <div class="empty-icon">🛒</div>
      <div class="empty-text">购物车是空的</div>
      <div class="empty-tip">快去选杯好喝的吧~</div>
    </div>

    <div v-else class="cart-content">
      <div class="input-section">
        <div class="input-item">
          <label class="input-label">桌号</label>
          <input 
            class="input-field" 
            type="text" 
            placeholder="请输入桌号（选填）"
            :value="tableNo"
            @input="handleTableNoChange"
          />
        </div>
        <div class="input-item">
          <label class="input-label">备注</label>
          <input 
            class="input-field" 
            type="text" 
            placeholder="请输入备注（选填）"
            :value="remark"
            @input="handleRemarkChange"
          />
        </div>
      </div>

      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <div class="item-info">
            <div class="item-name">{{ item.drinkName }}</div>
            <div class="item-spec">
              <span class="spec-tag">{{ getSugarLabel(item.sugar) }}</span>
              <span class="spec-tag">{{ getIceLabel(item.ice) }}</span>
            </div>
            <div class="item-price">¥{{ item.price }}</div>
          </div>
          <div class="item-actions">
            <div class="quantity-control">
              <button class="qty-btn" @click="decreaseQty(item)">-</button>
              <span class="qty-num">{{ item.quantity }}</span>
              <button class="qty-btn" @click="increaseQty(item)">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cartStore.items.length > 0" class="cart-footer">
      <div class="footer-info">
        <div class="total-text">共 {{ cartStore.totalCount }} 件</div>
        <div class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</div>
      </div>
      <button class="submit-btn" @click="submitOrder">提交订单</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createOrder } from '../api/index'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const tableNo = ref(cartStore.tableNo)
const remark = ref(cartStore.remark)

const sugarOptions = [
  { label: '无糖', value: 'none' },
  { label: '少糖', value: 'less' },
  { label: '正常', value: 'normal' },
  { label: '多糖', value: 'more' }
]

const iceOptions = [
  { label: '去冰', value: 'none' },
  { label: '少冰', value: 'less' },
  { label: '正常', value: 'normal' },
  { label: '多冰', value: 'more' }
]

const getSugarLabel = (value) => {
  const option = sugarOptions.find(o => o.value === value)
  return option ? option.label : '正常'
}

const getIceLabel = (value) => {
  const option = iceOptions.find(o => o.value === value)
  return option ? option.label : '正常'
}

const handleTableNoChange = (e) => {
  tableNo.value = e.target.value
  cartStore.setTableNo(e.target.value)
}

const handleRemarkChange = (e) => {
  remark.value = e.target.value
  cartStore.setRemark(e.target.value)
}

const decreaseQty = (item) => {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.quantity - 1)
  } else {
    cartStore.removeItem(item.id)
  }
}

const increaseQty = (item) => {
  cartStore.updateQuantity(item.id, item.quantity + 1)
}

const submitOrder = async () => {
  try {
    const res = await createOrder({
      items: cartStore.getOrderItems(),
      tableNo: tableNo.value,
      remark: remark.value
    })

    if (res.code === 200) {
      alert('下单成功！')
      cartStore.clearCart()
      tableNo.value = ''
      remark.value = ''
      setTimeout(() => {
        router.push('/orders')
      }, 500)
    }
  } catch (error) {
    console.error('下单失败:', error)
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  padding-bottom: 100px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 20px;
  color: #666;
  margin-bottom: 8px;
}

.empty-tip {
  font-size: 16px;
  color: #999;
}

.input-section {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 12px;
}

.input-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.input-item:last-child {
  margin-bottom: 0;
}

.input-label {
  width: 60px;
  font-size: 15px;
  color: #666;
}

.input-field {
  flex: 1;
  height: 45px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 15px;
  outline: none;
}

.cart-items {
  background-color: #fff;
  padding: 0 15px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 17px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.item-spec {
  margin-bottom: 8px;
}

.spec-tag {
  display: inline-block;
  padding: 2px 10px;
  background-color: #fff0f0;
  color: #ff6b6b;
  font-size: 12px;
  border-radius: 4px;
  margin-right: 8px;
}

.item-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff6b6b;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

.qty-num {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  min-width: 30px;
  text-align: center;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background-color: #fff;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding-bottom: calc(15px + env(safe-area-inset-bottom));
}

.footer-info {
  display: flex;
  flex-direction: column;
}

.total-text {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b6b;
}

.submit-btn {
  padding: 12px 40px;
  background-color: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
</style>
