<template>
  <div class="order-page">
    <van-nav-bar title="订单管理">
      <template #right>
        <van-icon name="plus" size="22" @click="showCreateOrder = true" />
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="activeTab" sticky background="#fff">
      <van-tab title="全部">
        <OrderList :status="null" @print-order="printOrder" @update-order="loadOrders" />
      </van-tab>
      <van-tab title="待接单">
        <OrderList status="pending" @print-order="printOrder" @update-order="loadOrders" />
      </van-tab>
      <van-tab title="制作中">
        <OrderList status="preparing" @print-order="printOrder" @update-order="loadOrders" />
      </van-tab>
      <van-tab title="已出餐">
        <OrderList status="ready" @print-order="printOrder" @update-order="loadOrders" />
      </van-tab>
    </van-tabs>

    <van-popup v-model:show="showCreateOrder" round position="bottom" :style="{ height: '90%' }">
      <div class="create-order">
        <van-nav-bar title="创建订单" left-text="取消" right-text="完成" @click-left="showCreateOrder = false" @click-right="submitOrder" />
        
        <div class="order-form">
          <van-field v-model="orderForm.customerName" label="顾客姓名" placeholder="请输入姓名" />
          <van-field v-model="orderForm.customerPhone" label="联系电话" placeholder="请输入电话" />
          <van-field v-model="orderForm.tableNumber" label="桌号" placeholder="请输入桌号" />
          <van-field v-model="orderForm.remark" label="备注" type="textarea" placeholder="请输入备注" />
        </div>

        <div class="product-list">
          <div class="section-title">选择商品</div>
          <div v-for="product in activeProducts" :key="product._id" class="product-item">
            <div class="product-detail">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
            </div>
            <van-stepper v-model="orderItems[product._id]" :min="0" :max="99" @change="updateOrderSummary" />
          </div>
        </div>

        <div class="order-summary">
          <div class="summary-item">
            <span>商品总数:</span>
            <span>{{ totalCount }} 件</span>
          </div>
          <div class="summary-item">
            <span>订单总金额:</span>
            <span class="total-amount">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showPrintPreview" round position="bottom" :style="{ height: '90%' }">
      <div class="print-preview">
        <van-nav-bar title="打印预览" left-text="关闭" @click-left="showPrintPreview = false">
          <template #right>
            <span class="print-btn" @click="doPrint">打印</span>
          </template>
        </van-nav-bar>
        
        <div class="print-content" ref="printContentRef">
          <div class="print-header">
            <div class="shop-name">外卖商家订单</div>
            <div class="order-no">订单号: {{ printOrder?.orderNo }}</div>
            <div class="order-time">下单时间: {{ formatTime(printOrder?.createdAt) }}</div>
          </div>
          
          <div class="print-info">
            <div v-if="printOrder?.customerName">顾客: {{ printOrder.customerName }}</div>
            <div v-if="printOrder?.customerPhone">电话: {{ printOrder.customerPhone }}</div>
            <div v-if="printOrder?.tableNumber">桌号: {{ printOrder.tableNumber }}</div>
            <div v-if="printOrder?.remark">备注: {{ printOrder.remark }}</div>
          </div>
          
          <div class="print-items">
            <div class="print-item header">
              <span class="col-name">商品名称</span>
              <span class="col-qty">数量</span>
              <span class="col-price">小计</span>
            </div>
            <div v-for="item in printOrder?.items" :key="item.productId" class="print-item">
              <span class="col-name">{{ item.productName }}</span>
              <span class="col-qty">{{ item.quantity }}</span>
              <span class="col-price">¥{{ item.subtotal.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="print-footer">
            <div class="total">合计: ¥{{ printOrder?.totalAmount.toFixed(2) }}</div>
            <div class="status">状态: {{ getStatusText(printOrder?.status) }}</div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { showToast, showDialog } from 'vant';
import OrderList from '../components/OrderList.vue';
import { orderApi, productApi } from '../utils/request';
import { orderSocket } from '../utils/websocket';

const activeTab = ref(0);
const showCreateOrder = ref(false);
const showPrintPreview = ref(false);
const printOrder = ref(null);
const printContentRef = ref(null);
const activeProducts = ref([]);

const orderForm = reactive({
  customerName: '',
  customerPhone: '',
  tableNumber: '',
  remark: '',
});

const orderItems = reactive({});

const totalCount = computed(() => {
  return Object.values(orderItems).reduce((sum, qty) => sum + Number(qty), 0);
});

const totalAmount = computed(() => {
  let total = 0;
  activeProducts.value.forEach((product) => {
    const qty = Number(orderItems[product._id] || 0);
    if (qty > 0) {
      total += product.price * qty;
    }
  });
  return total;
});

const loadActiveProducts = async () => {
  try {
    const data = await productApi.getActive();
    activeProducts.value = data;
    data.forEach((product) => {
      orderItems[product._id] = 0;
    });
  } catch (error) {
    console.error('加载商品失败:', error);
  }
};

const updateOrderSummary = () => {};

const submitOrder = async () => {
  const items = activeProducts.value
    .filter((product) => Number(orderItems[product._id]) > 0)
    .map((product) => ({
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: Number(orderItems[product._id]),
    }));

  if (items.length === 0) {
    showToast({ type: 'fail', message: '请选择至少一个商品' });
    return;
  }

  try {
    await orderApi.create({
      ...orderForm,
      items,
    });
    showToast({ type: 'success', message: '下单成功' });
    showCreateOrder.value = false;
    resetOrderForm();
  } catch (error) {
    console.error('创建订单失败:', error);
  }
};

const resetOrderForm = () => {
  orderForm.customerName = '';
  orderForm.customerPhone = '';
  orderForm.tableNumber = '';
  orderForm.remark = '';
  activeProducts.value.forEach((product) => {
    orderItems[product._id] = 0;
  });
};

const loadOrders = () => {};

const printOrderHandler = (order) => {
  printOrder.value = order;
  showPrintPreview.value = true;
};

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getStatusText = (status) => {
  const map = {
    pending: '待接单',
    preparing: '制作中',
    ready: '已出餐',
  };
  return map[status] || status;
};

const doPrint = async () => {
  try {
    await orderApi.markAsPrinted(printOrder.value._id);
    const content = printContentRef.value?.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>订单打印 - ${printOrder.value.orderNo}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 15px; }
            .shop-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .order-no, .order-time { font-size: 14px; color: #666; margin-bottom: 5px; }
            .print-info { margin-bottom: 20px; font-size: 14px; line-height: 1.8; }
            .print-item { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
            .print-item.header { font-weight: bold; background: #f5f5f5; }
            .col-name { flex: 2; }
            .col-qty { flex: 1; text-align: center; }
            .col-price { flex: 1; text-align: right; }
            .print-footer { margin-top: 20px; padding-top: 15px; border-top: 2px solid #000; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-bottom: 10px; }
            .status { text-align: center; color: #666; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    showPrintPreview.value = false;
    showToast({ type: 'success', message: '已标记为已打印' });
  } catch (error) {
    console.error('打印失败:', error);
  }
};

const handleOrderCreated = async (order) => {
  showDialog({
    title: '新订单提醒',
    message: `订单号: ${order.orderNo}\n金额: ¥${order.totalAmount.toFixed(2)}`,
  });
};

onMounted(() => {
  loadActiveProducts();
  orderSocket.connect();
  orderSocket.on('orderCreated', handleOrderCreated);
});

onUnmounted(() => {
  orderSocket.off('orderCreated', handleOrderCreated);
});
</script>

<style scoped>
.order-page {
  min-height: 100vh;
}

.create-order {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.order-form {
  background: #fff;
}

.product-list {
  flex: 1;
  overflow-y: auto;
  background: #f7f8fa;
  padding-bottom: 100px;
}

.section-title {
  padding: 12px 16px;
  font-size: 14px;
  color: #969799;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  margin-bottom: 8px;
}

.product-name {
  font-size: 16px;
  margin-bottom: 4px;
}

.product-price {
  font-size: 16px;
  color: #ff6034;
  font-weight: bold;
}

.order-summary {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #ebedf0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item {
  font-size: 15px;
}

.total-amount {
  color: #ff6034;
  font-weight: bold;
  font-size: 18px;
}

.print-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.print-btn {
  color: #1989fa;
  font-size: 16px;
}

.print-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fff;
  font-size: 14px;
}

.print-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px dashed #ccc;
  padding-bottom: 15px;
}

.shop-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.order-no,
.order-time {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.print-info {
  margin-bottom: 20px;
  line-height: 1.8;
}

.print-items {
  margin-bottom: 20px;
}

.print-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.print-item.header {
  font-weight: bold;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.col-name {
  flex: 2;
}

.col-qty {
  flex: 1;
  text-align: center;
}

.col-price {
  flex: 1;
  text-align: right;
}

.print-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #000;
}

.total {
  font-size: 18px;
  font-weight: bold;
  text-align: right;
  margin-bottom: 10px;
}

.status {
  text-align: center;
  color: #666;
}
</style>
