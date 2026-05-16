<template>
  <div class="report-page">
    <div class="header">
      <van-button type="default" size="small" @click="$router.back()">返回</van-button>
      <h2>日结报表</h2>
      <div></div>
    </div>

    <div class="date-selector">
      <van-field
        v-model="reportDate"
        type="date"
        label="选择日期"
        placeholder="选择日期"
        @change="loadReport"
      />
    </div>

    <div class="report-summary" v-if="report">
      <div class="summary-card">
        <div class="summary-item">
          <p class="label">订单数量</p>
          <p class="value">{{ report.orderCount || 0 }} 单</p>
        </div>
        <div class="summary-item">
          <p class="label">营业总额</p>
          <p class="value highlight">¥{{ formatAmount(report.totalAmount) }}</p>
        </div>
      </div>

      <div class="payment-breakdown">
        <h3>支付方式统计</h3>
        <div class="breakdown-item">
          <span>现金支付</span>
          <span>¥{{ formatAmount(report.cashAmount) }}</span>
        </div>
        <div class="breakdown-item">
          <span>微信支付</span>
          <span>¥{{ formatAmount(report.wechatAmount) }}</span>
        </div>
        <div class="breakdown-item">
          <span>支付宝支付</span>
          <span>¥{{ formatAmount(report.alipayAmount) }}</span>
        </div>
      </div>
    </div>

    <div class="order-list" v-if="report?.orders?.length > 0">
      <h3>订单明细</h3>
      <div class="order-card" v-for="order in report.orders" :key="order.id" @click="viewOrder(order.orderNo)">
        <div class="order-header">
          <span class="order-no">{{ order.orderNo }}</span>
          <span class="order-time">{{ formatTime(order.createTime) }}</span>
        </div>
        <div class="order-items">
          <span v-for="item in order.items.slice(0, 3)" :key="item.id" class="item-tag">
            {{ item.productName }} x{{ item.quantity }}
          </span>
          <span v-if="order.items.length > 3" class="item-tag">等{{ order.items.length }}件商品</span>
        </div>
        <div class="order-footer">
          <span class="payment-method">{{ getPaymentMethodText(order.paymentMethod) }}</span>
          <span class="total">¥{{ order.payAmount.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <van-empty v-if="report?.orders?.length === 0" description="当日暂无订单" />
    <div class="loading" v-if="loading">加载中...</div>

    <div class="report-actions">
      <van-button type="primary" block @click="printReport" :disabled="!report">打印报表</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { reportAPI } from '../api'

const router = useRouter()
const report = ref(null)
const loading = ref(true)
const reportDate = ref(new Date().toISOString().split('T')[0])

const formatAmount = (amount) => {
  if (!amount) return '0.00'
  return Number(amount).toFixed(2)
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const getPaymentMethodText = (method) => {
  const map = {
    'CASH': '现金',
    'WECHAT': '微信',
    'ALIPAY': '支付宝'
  }
  return map[method] || method
}

const viewOrder = (orderNo) => {
  router.push(`/receipt/${orderNo}`)
}

const loadReport = async () => {
  loading.value = true
  try {
    const res = await reportAPI.getDaily(reportDate.value)
    report.value = res.data
  } catch (e) {
    console.error('加载报表失败', e)
  } finally {
    loading.value = false
  }
}

const printReport = () => {
  window.print()
}

onMounted(() => {
  loadReport()
})
</script>

<style scoped>
.report-page {
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

.date-selector {
  padding: 16px;
  background: white;
  margin-bottom: 12px;
}

.report-summary {
  padding: 0 12px;
}

.summary-card {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 12px;
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-item .label {
  margin: 0 0 8px;
  font-size: 14px;
  color: #666;
}

.summary-item .value {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.summary-item .value.highlight {
  color: #f56c6c;
}

.payment-breakdown {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.payment-breakdown h3 {
  margin: 0 0 16px;
  font-size: 16px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.order-list {
  padding: 0 12px;
}

.order-list h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-no {
  font-size: 14px;
  font-weight: 500;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.order-items {
  margin-bottom: 12px;
}

.item-tag {
  display: inline-block;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 4px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.payment-method {
  font-size: 12px;
  color: #666;
}

.order-footer .total {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.loading {
  text-align: center;
  padding: 40px;
}

.report-actions {
  padding: 16px;
}

@media print {
  .header,
  .date-selector,
  .report-actions {
    display: none;
  }
}
</style>
