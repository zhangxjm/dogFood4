<template>
  <div class="order-detail-page">
    <van-nav-bar title="订单详情" left-arrow @click-left="router.back()" />
    
    <van-loading v-if="loading" class="loading" />
    
    <template v-else-if="order">
      <div class="status-bar">
        <van-icon name="checked" class="status-icon" />
        <div class="status-info">
          <h3>{{ order.status_display }}</h3>
          <p v-if="order.is_verified">已核销</p>
          <p v-else-if="order.verification_code">核销码：{{ order.verification_code }}</p>
        </div>
      </div>
      
      <van-cell-group inset>
        <van-cell title="订单号" :value="order.order_no" />
        <van-cell title="下单时间" :value="order.created_at" />
        <van-cell v-if="order.paid_at" title="支付时间" :value="order.paid_at" />
      </van-cell-group>
      
      <van-cell-group inset title="自提点">
        <van-cell :title="order.pickup_point?.name" :value="order.pickup_point?.address" />
        <van-cell title="联系方式" :value="order.pickup_point?.phone" />
        <van-cell title="提货方式" :value="order.pickup_method === 'self' ? '自提' : '配送'" />
      </van-cell-group>
      
      <van-cell-group inset title="商品">
        <van-cell v-for="item in order.items" :key="item.id">
          <div class="product-item">
            <van-image
              width="80"
              height="80"
              fit="cover"
              :src="item.product_image || 'https://fastly.jsdelivr.net/npm/@vant/assets/leaf.jpeg'"
            />
            <div class="product-info">
              <h4>{{ item.product_name }}</h4>
              <div class="price-row">
                <span class="price">¥{{ item.price }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
              <div class="subtotal">小计：¥{{ item.total_price }}</div>
            </div>
          </div>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset title="订单明细">
        <van-cell title="商品金额" :value="`¥${order.total_amount}`" />
        <van-cell title="优惠金额" :value="`¥${order.discount_amount}`" />
        <van-cell title="实付金额" :value="`¥${order.pay_amount}`" />
      </van-cell-group>
      
      <van-cell-group inset v-if="order.remark">
        <van-cell title="备注" :value="order.remark" />
      </van-cell-group>
      
      <div class="action-bar safe-area-bottom">
        <van-button
          v-if="order.status === 'pending'"
          type="danger"
          block
          @click="handlePay"
        >
          立即支付
        </van-button>
        <van-button
          v-if="order.status === 'pending'"
          block
          plain
          @click="handleCancel"
        >
          取消订单
        </van-button>
        <van-button
          v-if="order.status === 'delivered'"
          type="primary"
          block
          @click="handleConfirm"
        >
          确认收货
        </van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { getOrderDetail, payOrder, cancelOrder, confirmOrder } from '@/api/orders'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const order = ref(null)

async function fetchOrder() {
  loading.value = true
  try {
    const id = route.params.id
    order.value = await getOrderDetail(id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handlePay() {
  try {
    await payOrder(order.value.id, { payment_method: 'balance' })
    showSuccessToast('支付成功')
    fetchOrder()
  } catch (e) {
    console.error(e)
  }
}

async function handleCancel() {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要取消订单吗？'
    })
    await cancelOrder(order.value.id)
    showSuccessToast('取消成功')
    fetchOrder()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

async function handleConfirm() {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定已收到商品吗？'
    })
    await confirmOrder(order.value.id)
    showSuccessToast('确认成功')
    fetchOrder()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

onMounted(() => {
  fetchOrder()
})
</script>

<style scoped lang="less">
.order-detail-page {
  background: #f5f5f5;
  padding-bottom: 80px;
}

.loading {
  text-align: center;
  padding: 40px 0;
}

.status-bar {
  background: linear-gradient(135deg, #1989fa 0%, #5fb7ff 100%);
  padding: 30px 20px;
  display: flex;
  align-items: center;
  color: #fff;
  
  .status-icon {
    font-size: 40px;
    margin-right: 16px;
  }
  
  .status-info {
    h3 {
      margin: 0 0 4px;
      font-size: 18px;
    }
    p {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }
  }
}

.product-item {
  display: flex;
  width: 100%;
  
  .product-info {
    flex: 1;
    margin-left: 12px;
    
    h4 {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: normal;
    }
    
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      
      .price {
        font-size: 14px;
        color: #ee0a24;
      }
      .quantity {
        font-size: 13px;
        color: #969799;
      }
    }
    
    .subtotal {
      font-size: 13px;
      color: #969799;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px;
  display: flex;
  gap: 8px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}
</style>