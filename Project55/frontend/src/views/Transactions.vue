<template>
  <div class="page-container">
    <van-nav-bar title="交易记录" />
    
    <van-tabs v-model:active="activeTab" @change="loadTransactions">
      <van-tab title="我购买的" />
      <van-tab title="我卖出的" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="loadTransactions">
      <div v-if="transactions.length > 0">
        <div
          v-for="item in transactions"
          :key="item.id"
          class="product-card"
          @click="goProductDetail(item.productId)"
        >
          <div style="display: flex; padding: 12px;">
            <img
              v-if="item.productImage"
              :src="item.productImage"
              style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;"
            />
            <div v-else style="width: 80px; height: 80px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              <van-icon name="photo-o" size="24" color="#ccc" />
            </div>
            <div style="flex: 1; margin-left: 12px; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 15px; font-weight: 500; color: #333;">{{ item.productTitle }}</div>
              <div style="font-size: 18px; color: #f56c6c; font-weight: bold;">¥{{ item.price }}</div>
              <div style="font-size: 13px; color: #999;">
                {{ activeTab === 0 ? '卖家: ' + item.sellerName : '买家: ' + item.buyerName }}
              </div>
            </div>
          </div>
          <div style="padding: 8px 12px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #999;">订单号: {{ item.orderNo }}</span>
            <van-tag :type="item.status === 'PENDING' ? 'warning' : 'success'" size="small">
              {{ item.status === 'PENDING' ? '交易中' : '已完成' }}
            </van-tag>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <van-icon name="orders-o" size="48" color="#ccc" />
        <p style="margin-top: 12px;">暂无交易记录</p>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { transactionApi } from '../api'

const router = useRouter()
const activeTab = ref(0)
const refreshing = ref(false)
const transactions = ref([])
const user = JSON.parse(localStorage.getItem('user') || '{}')

const loadTransactions = async () => {
  if (!user.id) {
    router.push('/login')
    return
  }
  try {
    let res
    if (activeTab.value === 0) {
      res = await transactionApi.getByBuyer(user.id)
    } else {
      res = await transactionApi.getBySeller(user.id)
    }
    if (res.data.success) {
      transactions.value = res.data.data
    }
  } catch (e) {
    console.error(e)
  }
  refreshing.value = false
}

const goProductDetail = (id) => {
  router.push(`/product/${id}`)
}

onMounted(loadTransactions)
</script>
