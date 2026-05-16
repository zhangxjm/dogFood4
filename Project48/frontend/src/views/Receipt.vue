<template>
  <div class="receipt-page">
    <div class="header">
      <van-button type="default" size="small" @click="$router.push('/')">返回首页</van-button>
      <h2>订单小票</h2>
      <div></div>
    </div>

    <div class="receipt" id="receipt-content" v-if="order">
      <div class="receipt-header">
        <h3>奶茶店收银系统</h3>
        <p class="order-no">订单号: {{ order.orderNo }}</p>
        <p class="order-time">时间: {{ formatTime(order.createTime) }}</p>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-items">
        <div class="receipt-item" v-for="item in order.items" :key="item.id">
          <div class="item-name">{{ item.productName }}</div>
          <div class="item-spec">{{ item.sugarLevel }} / {{ item.iceLevel }}</div>
          <div class="item-qty">x{{ item.quantity }}</div>
          <div class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
        </div>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-summary">
        <div class="summary-row">
          <span>合计:</span>
          <span class="amount">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>支付方式:</span>
          <span>{{ getPaymentMethodText(order.paymentMethod) }}</span>
        </div>
        <div class="summary-row total">
          <span>实付:</span>
          <span class="amount">¥{{ order.payAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="receipt-footer">
        <p>谢谢惠顾，欢迎下次光临！</p>
      </div>
    </div>

    <div class="receipt-actions">
      <van-button type="primary" block @click="printReceipt">打印小票</van-button>
    </div>

    <van-empty v-if="!order && !loading" description="订单不存在" />
    <div class="loading" v-if="loading">加载中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { orderAPI } from '../api'

const route = useRoute()
const order = ref(null)
const loading = ref(true)

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

const getPaymentMethodText = (method) => {
  const map = {
    'CASH': '现金支付',
    'WECHAT': '微信支付',
    'ALIPAY': '支付宝支付'
  }
  return map[method] || method
}

const printReceipt = () => {
  window.print()
}

onMounted(async () => {
  try {
    const res = await orderAPI.getByNo(route.params.orderNo)
    order.value = res.data
  } catch (e) {
    console.error('加载订单失败', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.receipt-page {
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

.receipt {
  margin: 20px auto;
  padding: 20px;
  max-width: 400px;
  background: white;
  border: 1px dashed #ccc;
}

.receipt-header {
  text-align: center;
}

.receipt-header h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.receipt-header p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.receipt-divider {
  height: 1px;
  background: repeating-linear-gradient(90deg, #ccc, #ccc 4px, transparent 4px, transparent 8px);
  margin: 16px 0;
}

.receipt-item {
  display: grid;
  grid-template-columns: 2fr 1fr 40px 60px;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 8px;
}

.item-name {
  font-weight: 500;
}

.item-spec {
  color: #999;
  font-size: 12px;
}

.item-price {
  text-align: right;
}

.receipt-summary {
  margin-top: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.summary-row.total {
  font-weight: bold;
  font-size: 16px;
  padding-top: 8px;
  border-top: 1px solid #eee;
}

.summary-row .amount {
  color: #f56c6c;
}

.receipt-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 12px;
  color: #999;
}

.receipt-actions {
  padding: 16px;
}

.loading {
  text-align: center;
  padding: 40px;
}

@media print {
  .header,
  .receipt-actions {
    display: none;
  }
  
  .receipt {
    border: none;
    margin: 0;
    padding: 0;
  }
}
</style>
