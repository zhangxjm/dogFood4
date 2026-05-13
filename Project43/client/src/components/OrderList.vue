<template>
  <van-pull-refresh v-model="refreshing" @refresh="loadOrders">
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadOrders">
      <div v-for="order in orders" :key="order._id" class="order-card">
        <div class="order-header">
          <span class="order-no">{{ order.orderNo }}</span>
          <van-tag :type="getStatusTagType(order.status)">{{ getStatusText(order.status) }}</van-tag>
        </div>
        
        <div class="order-info">
          <div v-if="order.customerName" class="info-row">
            <span class="label">顾客:</span>
            <span>{{ order.customerName }}</span>
          </div>
          <div v-if="order.tableNumber" class="info-row">
            <span class="label">桌号:</span>
            <span>{{ order.tableNumber }}</span>
          </div>
          <div class="info-row">
            <span class="label">下单时间:</span>
            <span>{{ formatTime(order.createdAt) }}</span>
          </div>
          <div v-if="order.remark" class="info-row remark">
            <span class="label">备注:</span>
            <span>{{ order.remark }}</span>
          </div>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.productId" class="order-item">
            <span class="item-name">{{ item.productName }}</span>
            <span class="item-qty">x{{ item.quantity }}</span>
            <span class="item-price">¥{{ item.subtotal.toFixed(2) }}</span>
          </div>
        </div>

        <div class="order-footer">
          <span class="total-amount">¥{{ order.totalAmount.toFixed(2) }}</span>
          <div class="order-actions">
            <van-button type="primary" size="small" plain @click="$emit('print-order', order)">打印</van-button>
            <template v-if="order.status === 'pending'">
              <van-button type="warning" size="small" @click="updateOrderStatus(order._id, 'preparing')">开始制作</van-button>
            </template>
            <template v-else-if="order.status === 'preparing'">
              <van-button type="success" size="small" @click="updateOrderStatus(order._id, 'ready')">完成出餐</van-button>
            </template>
          </div>
        </div>
      </div>
    </van-list>
  </van-pull-refresh>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { showToast } from 'vant';
import { orderApi } from '../utils/request';
import { orderSocket } from '../utils/websocket';

const props = defineProps({
  status: {
    type: String,
    default: null,
  },
});

defineEmits(['print-order', 'update-order']);

const orders = ref([]);
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);

const loadOrders = async () => {
  try {
    const data = await orderApi.getAll(props.status);
    orders.value = data;
    finished.value = true;
  } catch (error) {
    console.error('加载订单失败:', error);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    await orderApi.updateStatus(orderId, status);
    showToast({ type: 'success', message: '状态已更新' });
    loadOrders();
  } catch (error) {
    console.error('更新订单状态失败:', error);
  }
};

const getStatusText = (status) => {
  const map = {
    pending: '待接单',
    preparing: '制作中',
    ready: '已出餐',
  };
  return map[status] || status;
};

const getStatusTagType = (status) => {
  const map = {
    pending: 'warning',
    preparing: 'primary',
    ready: 'success',
  };
  return map[status] || 'default';
};

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const handleOrderCreated = () => {
  loadOrders();
};

const handleOrderStatusChanged = () => {
  loadOrders();
};

watch(() => props.status, () => {
  finished.value = false;
  loadOrders();
});

onMounted(() => {
  loadOrders();
  orderSocket.connect();
  orderSocket.on('orderCreated', handleOrderCreated);
  orderSocket.on('orderStatusChanged', handleOrderStatusChanged);
});

onUnmounted(() => {
  orderSocket.off('orderCreated', handleOrderCreated);
  orderSocket.off('orderStatusChanged', handleOrderStatusChanged);
});
</script>

<style scoped>
.order-card {
  margin: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebedf0;
}

.order-no {
  font-size: 15px;
  font-weight: 600;
}

.order-info {
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
}

.info-row {
  margin-bottom: 6px;
  display: flex;
}

.label {
  width: 70px;
  color: #969799;
}

.remark {
  color: #ff6034;
}

.order-items {
  margin-bottom: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 14px;
}

.item-name {
  flex: 2;
}

.item-qty {
  flex: 1;
  text-align: center;
  color: #666;
}

.item-price {
  flex: 1;
  text-align: right;
  color: #ff6034;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebedf0;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #ff6034;
}

.order-actions {
  display: flex;
  gap: 8px;
}
</style>
