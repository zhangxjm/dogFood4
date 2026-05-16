<template>
  <div class="payments-page">
    <van-nav-bar title="缴费记录" fixed placeholder />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了">
        <van-cell-group v-for="payment in payments" :key="payment.id" class="card-item">
          <van-cell :title="payment.student_name">
            <template #label>
              <div style="font-size: 13px; color: #666">
                课程：{{ payment.course_name }}
              </div>
              <div style="font-size: 12px; color: #999; margin-top: 4px">
                支付方式：{{ payment.payment_method }} · {{ payment.paid_at }}
              </div>
            </template>
            <template #right-icon>
              <span style="color: #07c160; font-weight: bold; font-size: 16px">
                ¥{{ payment.amount }}
              </span>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>

    <div class="summary-card">
      <div class="summary-item">
        <div class="summary-label">总缴费笔数</div>
        <div class="summary-value">{{ payments.length }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">总缴费金额</div>
        <div class="summary-value highlight">¥{{ totalAmount }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getPayments } from '../api'

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const payments = ref([])

const totalAmount = computed(() => {
  return payments.value.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)
})

const loadData = async () => {
  try {
    const res = await getPayments()
    payments.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const onRefresh = async () => {
  await loadData()
  refreshing.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.summary-card {
  margin: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  justify-content: space-around;
}

.summary-item {
  text-align: center;
  color: white;
}

.summary-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
}

.summary-value.highlight {
  color: #ffd700;
}
</style>
