<template>
  <div class="order-confirm-page page">
    <van-nav-bar title="确认订单" left-arrow @click-left="$router.back()" />
    
    <div class="content">
      <van-cell-group inset>
        <van-cell title="桌号" :value="cartStore.tableInfo?.tableName || cartStore.tableInfo?.tableNo" />
        <van-cell title="就餐人数">
          <template #default>
            <van-stepper v-model="customerCount" :min="1" :max="20" />
          </template>
        </van-cell>
        <van-field
          v-model="remark"
          type="textarea"
          label="备注"
          placeholder="请输入备注（可选）"
          maxlength="100"
          show-word-limit
          :autosize="{ minRows: 2 }"
        />
      </van-cell-group>

      <div class="cart-title">已选商品</div>
      <van-cell-group inset>
        <div v-for="item in cartStore.cartItems" :key="item.id" class="cart-item">
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-price">
              <span class="price">¥{{ item.price }}</span>
              <span class="quantity">x {{ item.quantity }}</span>
            </div>
          </div>
          <div class="item-total price">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
        </div>
      </van-cell-group>

      <van-cell-group inset>
        <van-cell title="商品金额" :value="'¥' + cartStore.totalPrice" />
      </van-cell-group>
    </div>

    <van-submit-bar
      :price="parseFloat(cartStore.totalPrice) * 100"
      button-text="提交订单"
      :loading="submitting"
      @submit="submitOrder"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { createOrder, addOrderItems } from '@/api'
import { useCartStore } from '@/stores'

const router = useRouter()
const cartStore = useCartStore()
const customerCount = ref(1)
const remark = ref('')
const submitting = ref(false)

const submitOrder = async () => {
  if (submitting.value) return
  
  submitting.value = true
  try {
    const data = {
      tableId: cartStore.tableInfo.id,
      tableNo: cartStore.tableInfo.tableNo,
      customerCount: customerCount.value,
      remark: remark.value,
      items: cartStore.cartItems.map(item => ({
        dishId: item.id,
        dishName: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    }
    
    let result
    if (cartStore.currentOrder) {
      result = await addOrderItems(cartStore.currentOrder.order.orderNo, data)
    } else {
      result = await createOrder(data)
    }
    
    cartStore.setOrder(result)
    cartStore.clearCart()
    showToast('下单成功')
    router.push('/order-detail?orderNo=' + result.order.orderNo)
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="less">
.order-confirm-page {
  padding-top: 0;
}

.content {
  padding: 10px;
  padding-bottom: 60px;
}

.cart-title {
  padding: 10px 16px;
  font-size: 14px;
  color: #666;
  font-weight: bold;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  .item-info {
    .item-name {
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .item-price {
      font-size: 12px;
      color: #999;
      
      .price {
        margin-right: 8px;
        color: #ff4d4f;
      }
      
      .quantity {
        color: #666;
      }
    }
  }
  
  .item-total {
    font-size: 15px;
  }
}
</style>
