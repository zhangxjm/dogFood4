<template>
  <view class="container">
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <view v-else-if="order" class="order-detail">
      <view class="order-header">
        <view class="header-left">
          <text class="order-no">{{ order.order_no }}</text>
          <text class="order-time">{{ formatTime(order.created_at) }}</text>
        </view>
        <text :class="['status-tag', order.status]">{{ getStatusText(order.status) }}</text>
      </view>

      <view class="order-items">
        <text class="section-title">商品清单</text>
        <view 
          v-for="item in order.items" 
          :key="item.id" 
          class="item-row"
        >
          <view class="item-info">
            <text class="item-name">{{ item.product_name }}</text>
            <text class="item-price">¥{{ item.price }}</text>
          </view>
          <view class="item-right">
            <text class="item-qty">x{{ item.quantity }}</text>
            <text class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <view v-if="order.remark" class="order-remark">
        <text class="section-title">备注</text>
        <text class="remark-text">{{ order.remark }}</text>
      </view>

      <view class="order-summary">
        <view class="summary-row">
          <text class="summary-label">商品数量</text>
          <text class="summary-value">{{ getItemCount() }} 件</text>
        </view>
        <view class="summary-row total">
          <text class="summary-label">订单金额</text>
          <text class="summary-value">¥{{ order.total_amount.toFixed(2) }}</text>
        </view>
      </view>

      <view v-if="order.status === 'pending'" class="order-actions">
        <view class="action-btn cancel" @click="cancelOrder">
          <text>取消订单</text>
        </view>
        <view class="action-btn complete" @click="completeOrder">
          <text>标记完成</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderById, updateOrderStatus } from '@/utils/api'

export default {
  data() {
    return {
      order: null,
      loading: false
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id
      this.loadOrderDetail()
    }
  },
  methods: {
    async loadOrderDetail() {
      this.loading = true
      try {
        const result = await getOrderById(this.orderId)
        this.order = result.data
      } catch (error) {
        console.error('加载订单详情失败:', error)
        uni.showToast({
          title: '加载订单详情失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
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
    getItemCount() {
      if (!this.order || !this.order.items) return 0
      return this.order.items.reduce((total, item) => total + item.quantity, 0)
    },
    async updateStatus(status) {
      try {
        await updateOrderStatus(this.orderId, status)
        uni.showToast({
          title: '操作成功',
          icon: 'success'
        })
        this.loadOrderDetail()
      } catch (error) {
        console.error('更新订单状态失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },
    async cancelOrder() {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个订单吗？',
        success: (res) => {
          if (res.confirm) {
            this.updateStatus('cancelled')
          }
        }
      })
    },
    async completeOrder() {
      uni.showModal({
        title: '确认完成',
        content: '确定要标记这个订单为已完成吗？',
        success: (res) => {
          if (res.confirm) {
            this.updateStatus('completed')
          }
        }
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

.order-detail {
  padding: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx 20rpx 0 0;
  margin-bottom: 2rpx;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.order-no {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.status-tag {
  font-size: 24rpx;
  padding: 10rpx 25rpx;
  border-radius: 25rpx;
  height: fit-content;
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

.order-items {
  background: #fff;
  padding: 30rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.item-price {
  font-size: 26rpx;
  color: #999;
}

.item-right {
  display: flex;
  align-items: center;
}

.item-qty {
  font-size: 26rpx;
  color: #666;
  margin-right: 30rpx;
}

.item-total {
  font-size: 30rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.order-remark {
  background: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
  border-radius: 20rpx;
}

.remark-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.order-summary {
  background: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
  border-radius: 20rpx;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
}

.summary-row.total {
  padding-top: 20rpx;
  margin-top: 10rpx;
  border-top: 2rpx solid #f5f5f5;
}

.summary-label {
  font-size: 28rpx;
  color: #666;
}

.summary-value {
  font-size: 28rpx;
  color: #333;
}

.summary-row.total .summary-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.order-actions {
  display: flex;
  padding: 40rpx 20rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25rpx;
  border-radius: 50rpx;
  margin: 0 10rpx;
}

.action-btn text {
  font-size: 30rpx;
  font-weight: bold;
}

.action-btn.cancel {
  background: #f5f5f5;
}

.action-btn.cancel text {
  color: #666;
}

.action-btn.complete {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
}

.action-btn.complete text {
  color: #fff;
}
</style>
