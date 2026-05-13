<template>
  <div class="leader-orders-page">
    <van-nav-bar title="订单管理" />
    
    <van-tabs v-model:active="activeStatus">
      <van-tab title="全部" />
      <van-tab title="待支付" />
      <van-tab title="待核销" />
      <van-tab title="已完成" />
    </van-tabs>
    
    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="orders.length === 0" description="暂无订单" />
    
    <div class="order-list">
      <van-cell-group v-for="order in orders" :key="order.id" class="order-card" inset @click="goDetail(order.id)">
        <van-cell :title="order.order_no" :value="order.status_display" clickable />
        <van-cell v-for="item in order.items" :key="item.id">
          <div class="order-item">
            <van-image
              width="60"
              height="60"
              fit="cover"
              :src="item.product_image || 'https://fastly.jsdelivr.net/npm/@vant/assets/leaf.jpeg'"
            />
            <div class="item-info">
              <h4>{{ item.product_name }}</h4>
              <div class="item-price">
                <span>¥{{ item.price }}</span>
                <span>x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </van-cell>
        <van-cell>
          <template #title>
            <div class="order-total">
              共{{ order.items.length }}件
              <span class="total-price">实付：¥{{ order.pay_amount }}</span>
            </div>
          </template>
          <template #value>
            <div class="order-actions">
              <span v-if="order.verification_code && !order.is_verified" class="verify-code">
                核销码：{{ order.verification_code }}
              </span>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getLeaderOrders } from '@/api/orders'

const router = useRouter()
const activeStatus = ref(0)
const orders = ref([])
const loading = ref(false)

const statusMap = ['', 'pending', 'paid', 'completed']

async function fetchOrders() {
  loading.value = true
  try {
    const status = statusMap[activeStatus.value]
    const res = await getLeaderOrders(status ? { status } : {})
    orders.value = res.results || res
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function goDetail(id) {
  router.push(`/order/${id}`)
}

watch(activeStatus, () => {
  fetchOrders()
})

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped lang="less">
.leader-orders-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.loading {
  text-align: center;
  padding: 40px 0;
}

.order-list {
  padding: 12px;
}

.order-card {
  margin-bottom: 12px;
}

.order-item {
  display: flex;
  
  .item-info {
    margin-left: 12px;
    flex: 1;
    
    h4 {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: normal;
    }
    
    .item-price {
      font-size: 12px;
      color: #969799;
      display: flex;
      justify-content: space-between;
    }
  }
}

.order-total {
  font-size: 13px;
  
  .total-price {
    float: right;
    color: #ee0a24;
    font-weight: bold;
  }
}

.verify-code {
  font-size: 12px;
  color: #1989fa;
}
</style>