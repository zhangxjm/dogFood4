<template>
  <div class="orders-page page-container">
    <van-nav-bar title="我的订单" />
    
    <van-tabs v-model:active="activeStatus">
      <van-tab title="全部" />
      <van-tab title="待支付" />
      <van-tab title="待收货" />
      <van-tab title="已完成" />
    </van-tabs>
    
    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="orders.length === 0" description="暂无订单" />
    <div class="order-list">
      <van-cell-group v-for="order in orders" :key="order.id" class="order-card" inset>
        <van-cell :title="order.order_no" :value="order.status_display" />
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
              共{{ order.items.length }}件商品
              <span class="total-price">实付：¥{{ order.pay_amount }}</span>
            </div>
          </template>
          <template #value>
            <div class="order-actions">
              <van-button
                v-if="order.status === 'pending'"
                size="mini"
                type="danger"
                @click="handlePay(order.id)"
              >
                去支付
              </van-button>
              <van-button
                v-if="order.status === 'pending'"
                size="mini"
                plain
                @click="handleCancel(order.id)"
              >
                取消订单
              </van-button>
              <van-button
                v-if="order.status === 'delivered'"
                size="mini"
                type="primary"
                @click="handleConfirm(order.id)"
              >
                确认收货
              </van-button>
              <van-button
                size="mini"
                plain
                @click="goDetail(order.id)"
              >
                查看详情
              </van-button>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <Tabbar />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast, showSuccessToast } from 'vant'
import { getOrders, payOrder, cancelOrder, confirmOrder } from '@/api/orders'
import Tabbar from '@/components/Tabbar.vue'

const router = useRouter()
const activeStatus = ref(0)
const orders = ref([])
const loading = ref(false)

const statusMap = ['', 'pending', 'paid', 'completed']

onMounted(() => {
  fetchOrders()
})

watch(activeStatus, () => {
  fetchOrders()
})

async function fetchOrders() {
  loading.value = true
  try {
    const status = statusMap[activeStatus.value]
    const params = status ? { status } : {}
    const res = await getOrders(params)
    orders.value = res.results || res
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handlePay(id) {
  try {
    await payOrder(id, { payment_method: 'balance' })
    showSuccessToast('支付成功')
    fetchOrders()
  } catch (e) {
    console.error(e)
  }
}

async function handleCancel(id) {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要取消订单吗？'
    })
    await cancelOrder(id)
    showSuccessToast('取消成功')
    fetchOrders()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

async function handleConfirm(id) {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定已收到商品吗？'
    })
    await confirmOrder(id)
    showSuccessToast('确认成功')
    fetchOrders()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

function goDetail(id) {
  router.push(`/order/${id}`)
}
</script>

<style scoped lang="less">
.orders-page {
  background: #f7f8fa;
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

.order-actions {
  display: flex;
  gap: 8px;
}
</style>
