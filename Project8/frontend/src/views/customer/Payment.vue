<template>
  <div class="payment-page page">
    <van-nav-bar title="结账" left-arrow @click-left="$router.back()" />
    
    <div class="content" v-if="orderDetail">
      <van-cell-group inset>
        <van-cell title="订单号" :value="orderDetail.order.orderNo" />
        <van-cell title="桌号" :value="orderDetail.tableName || orderDetail.tableNo" />
      </van-cell-group>

      <div class="section-title">商品清单</div>
      <van-cell-group inset>
        <div v-for="item in orderDetail.items" :key="item.id" class="item-row">
          <span>{{ item.dishName }} x{{ item.quantity }}</span>
          <span class="price">¥{{ item.amount }}</span>
        </div>
        <div class="item-row total-row">
          <span>合计</span>
          <span class="price total">¥{{ orderDetail.order.payAmount }}</span>
        </div>
      </van-cell-group>

      <div class="section-title">支付方式</div>
      <van-radio-group v-model="payMethod">
        <van-cell-group inset>
          <van-cell
            v-for="method in payMethods"
            :key="method.value"
            :title="method.label"
            clickable
            @click="payMethod = method.value"
          >
            <template #icon>
              <van-icon :name="method.icon" :color="method.color" size="24" />
            </template>
            <template #right-icon>
              <van-radio :name="method.value" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </div>

    <van-submit-bar
      :price="parseFloat(orderDetail?.order?.payAmount || 0) * 100"
      button-text="确认支付"
      :loading="paying"
      @submit="doPay"
    />

    <van-loading v-if="loading" type="spinner" class="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getOrder, updateOrderStatus } from '@/api'
import { useCartStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const orderDetail = ref(null)
const loading = ref(true)
const paying = ref(false)
const payMethod = ref('wechat')

const payMethods = [
  { value: 'wechat', label: '微信支付', icon: 'chat-o', color: '#07c160' },
  { value: 'alipay', label: '支付宝', icon: 'wallet-o', color: '#1677ff' },
  { value: 'cash', label: '现金支付', icon: 'money-o', color: '#ff4d4f' }
]

const loadOrder = async () => {
  try {
    const orderNo = route.query.orderNo || cartStore.currentOrder?.order?.orderNo
    if (orderNo) {
      orderDetail.value = await getOrder(orderNo)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const doPay = async () => {
  if (paying.value) return
  paying.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    await updateOrderStatus(orderDetail.value.order.orderNo, 'COMPLETED')
    showToast('支付成功')
    cartStore.clearAll()
    router.replace('/order-detail?orderNo=' + orderDetail.value.order.orderNo)
  } catch (e) {
    console.error(e)
  } finally {
    paying.value = false
  }
}

onMounted(loadOrder)
</script>

<style scoped lang="less">
.payment-page {
  padding-top: 0;
}

.content {
  padding: 10px;
  padding-bottom: 60px;
}

.section-title {
  padding: 10px 16px;
  font-size: 14px;
  color: #666;
  font-weight: bold;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  font-size: 14px;
  
  &.total-row {
    border-top: 1px solid #eee;
    padding-top: 12px;
    font-weight: bold;
    
    .total {
      font-size: 18px;
    }
  }
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
