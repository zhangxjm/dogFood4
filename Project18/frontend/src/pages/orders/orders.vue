<template>
  <view class="container">
    <view class="filter-tabs">
      <view 
        v-for="tab in statusTabs" 
        :key="tab.value"
        :class="['tab-item', currentFilter === tab.value ? 'active' : '']"
        @click="selectFilter(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <view v-else-if="orders.length === 0" class="empty">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无订单</text>
      <view class="go-order-btn" @click="goToMenu">
        <text>去点单</text>
      </view>
    </view>

    <view v-else class="order-list">
      <view 
        v-for="order in orders" 
        :key="order.id" 
        class="order-card"
        @click="viewOrderDetail(order.id)"
      >
        <view class="order-header">
          <text class="order-no">{{ order.order_no }}</text>
          <text :class="['status-tag', order.status]">{{ getStatusText(order.status) }}</text>
        </view>
        <view class="order-body">
          <text class="order-count">共 {{ order.item_count }} 件商品</text>
          <text class="order-time">{{ formatTime(order.created_at) }}</text>
        </view>
        <view class="order-footer">
          <text class="order-amount">实付：¥{{ order.total_amount.toFixed(2) }}</text>
          <text class="order-arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrders } from '@/utils/api'

export default {
  data() {
    return {
      orders: [],
      loading: false,
      currentFilter: null,
      statusTabs: [
        { label: '全部', value: null },
        { label: '待处理', value: 'pending' },
        { label: '已完成', value: 'completed' },
        { label: '已取消', value: 'cancelled' }
      ]
    }
  },
  onShow() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      this.loading = true
      try {
        const result = await getOrders(this.currentFilter)
        this.orders = result.data
      } catch (error) {
        console.error('加载订单失败:', error)
        uni.showToast({
          title: '加载订单失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    selectFilter(status) {
      this.currentFilter = status
      this.loadOrders()
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '待处理',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    },
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}`
    },
    viewOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/orders/order-detail?id=${orderId}`
      })
    },
    goToMenu() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.filter-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx 10rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-item {
  flex-shrink: 0;
  padding: 15rpx 35rpx;
  margin: 0 10rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
}

.tab-item text {
  font-size: 28rpx;
  color: #666;
}

.tab-item.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
}

.tab-item.active text {
  color: #fff;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx;
}

.loading text {
  font-size: 28rpx;
  color: #999;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 60rpx;
}

.empty-icon {
  font-size: 160rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 50rpx;
}

.go-order-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
}

.go-order-btn text {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}

.order-list {
  padding: 20rpx;
}

.order-card {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.order-no {
  font-size: 28rpx;
  color: #666;
}

.status-tag {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.status-tag.pending {
  background: #fff3e0;
  color: #ff9800;
}

.status-tag.completed {
  background: #e8f5e9;
  color: #4caf50;
}

.status-tag.cancelled {
  background: #ffebee;
  color: #f44336;
}

.order-body {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.order-count {
  font-size: 28rpx;
  color: #666;
}

.order-time {
  font-size: 26rpx;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.order-arrow {
  font-size: 36rpx;
  color: #ccc;
}
</style>
