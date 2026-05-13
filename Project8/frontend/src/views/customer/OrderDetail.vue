<template>
  <div class="order-detail-page page">
    <van-nav-bar title="订单详情" left-arrow @click-left="$router.back()" />
    
    <div class="content" v-if="orderDetail">
      <van-cell-group inset>
        <van-cell title="订单号" :value="orderDetail.order.orderNo" />
        <van-cell title="桌号" :value="orderDetail.tableName || orderDetail.tableNo" />
        <van-cell title="状态">
          <template #default>
            <span :class="['status-badge', 'status-' + orderDetail.order.status.toLowerCase()]">
              {{ statusText(orderDetail.order.status) }}
            </span>
          </template>
        </van-cell>
        <van-cell title="下单时间" :value="formatTime(orderDetail.order.createdAt)" />
        <van-cell v-if="orderDetail.order.remark" title="备注" :value="orderDetail.order.remark" />
      </van-cell-group>

      <div class="section-title">商品列表</div>
      <van-cell-group inset>
        <div v-for="item in orderDetail.items" :key="item.id" class="order-item">
          <div class="item-info">
            <div class="item-name">{{ item.dishName }}</div>
            <div class="item-price">
              <span class="price">¥{{ item.price }}</span>
              <span class="quantity">x {{ item.quantity }}</span>
            </div>
          </div>
          <div class="item-total price">¥{{ item.amount }}</div>
        </div>
      </van-cell-group>

      <van-cell-group inset>
        <van-cell title="商品金额" :value="'¥' + orderDetail.order.totalAmount" />
        <van-cell title="实付金额">
          <template #default>
            <span class="price total-price">¥{{ orderDetail.order.payAmount }}</span>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <div class="bottom-bar" v-if="orderDetail">
      <van-button
        block
        v-if="orderDetail.order.status === 'PENDING'"
        type="primary"
        @click="addMore"
      >
        继续加菜
      </van-button>
      <van-button
        block
        v-else-if="orderDetail.order.status !== 'COMPLETED'"
        type="primary"
        @click="goPayment"
      >
        去结账
      </van-button>
      <div
        v-else
        class="completed-tip"
      >
        <van-icon name="checked" color="#07c160" size="20" />
        订单已完成
      </div>
    </div>

    <van-loading v-if="loading" type="spinner" class="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrder } from '@/api'
import { useCartStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const orderDetail = ref(null)
const loading = ref(true)

const statusText = (status) => {
  const map = {
    PENDING: '待确认',
    CONFIRMED: '已接单',
    PREPARING: '制作中',
    COMPLETED: '已完成'
  }
  return map[status] || status
}

const formatTime = (time) => {
  if (!time) return ''
  const t = new Date(time)
  const pad = n => n.toString().padStart(2, '0')
  return `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
}

const loadOrder = async () => {
  try {
    const orderNo = route.query.orderNo || cartStore.currentOrder?.order?.orderNo
    if (orderNo) {
      orderDetail.value = await getOrder(orderNo)
      cartStore.setOrder(orderDetail.value)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const addMore = () => {
  router.push('/menu')
}

const goPayment = () => {
  router.push('/payment?orderNo=' + orderDetail.value.order.orderNo)
}

onMounted(loadOrder)
</script>

<style scoped lang="less">
.order-detail-page {
  padding-top: 0;
}

.content {
  padding: 10px;
  padding-bottom: 80px;
}

.section-title {
  padding: 10px 16px;
  font-size: 14px;
  color: #666;
  font-weight: bold;
}

.order-item {
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
      
      .price {
        margin-right: 8px;
      }
    }
  }
}

.total-price {
  font-size: 18px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  
  .completed-tip {
    text-align: center;
    padding: 10px;
    color: #07c160;
    font-weight: bold;
  }
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
