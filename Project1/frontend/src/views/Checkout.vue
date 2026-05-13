<template>
  <div class="checkout-page">
    <van-nav-bar title="确认下单" left-arrow @click-left="router.back()" />
    
    <van-loading v-if="loading" class="loading" />
    
    <template v-else>
      <van-cell-group inset>
        <van-cell title="自提点" is-link @click="showPickupPicker = true">
          <template #value>
            <div class="pickup-info">
              <div>{{ selectedPickup?.name || '请选择自提点' }}</div>
              <div v-if="selectedPickup" class="pickup-address">{{ selectedPickup.address }}</div>
            </div>
          </template>
        </van-cell>
        <van-cell title="提货方式">
          <template #value>
            <van-radio-group v-model="form.pickup_method" direction="horizontal">
              <van-radio name="self">自提</van-radio>
              <van-radio name="delivery">配送</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset title="商品">
        <van-cell>
          <div class="product-item">
            <van-image
              width="80"
              height="80"
              fit="cover"
              :src="product?.image || 'https://fastly.jsdelivr.net/npm/@vant/assets/leaf.jpeg'"
            />
            <div class="product-info">
              <h4>{{ product?.name }}</h4>
              <div class="price-row">
                <span class="price">¥{{ price }}</span>
                <van-stepper v-model="form.quantity" :min="1" :max="product?.stock || 99" />
              </div>
            </div>
          </div>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset>
        <van-field
          v-model="form.remark"
          type="textarea"
          label="备注"
          placeholder="选填，请输入备注信息"
          :autosize="{ minRows: 2 }"
        />
      </van-cell-group>
      
      <van-cell-group inset title="订单明细">
        <van-cell title="商品金额" :value="`¥${subtotal}`" />
        <van-cell title="优惠金额" value="¥0.00" />
        <van-cell title="实付金额" :value="`¥${total}`" />
      </van-cell-group>
      
      <div class="submit-bar safe-area-bottom">
        <div class="total-price">
          <span>合计：</span>
          <span class="price">¥{{ total }}</span>
        </div>
        <van-button type="primary" round size="large" :loading="submitting" @click="handleSubmit">
          提交订单
        </van-button>
      </div>
      
      <van-popup v-model:show="showPickupPicker" position="bottom" round>
        <van-picker
          title="选择自提点"
          :columns="pickupColumns"
          @confirm="onPickupConfirm"
          @cancel="showPickupPicker = false"
        />
      </van-popup>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { getProductDetail } from '@/api/products'
import { getPublicPickupPoints } from '@/api/pickup'
import { createOrder, payOrder } from '@/api/orders'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const showPickupPicker = ref(false)
const product = ref(null)
const pickupPoints = ref([])
const selectedPickup = ref(null)
const price = ref(0)

const form = ref({
  product_id: null,
  quantity: 1,
  group_buy_id: null,
  pickup_point_id: null,
  pickup_method: 'self',
  remark: ''
})

const pickupColumns = computed(() => {
  return pickupPoints.value.map(p => ({ text: p.name, value: p.id }))
})

const subtotal = computed(() => (price.value * form.value.quantity).toFixed(2))
const total = computed(() => subtotal.value)

async function initData() {
  loading.value = true
  try {
    const productId = route.query.productId || route.state?.product?.id
    const quantity = route.query.quantity || route.state?.quantity || 1
    const groupBuyId = route.query.groupBuyId || route.state?.groupBuyId
    const pickupPointId = route.state?.pickupPointId
    
    if (!productId) {
      showToast('参数错误')
      router.back()
      return
    }
    
    form.value.product_id = parseInt(productId)
    form.value.quantity = parseInt(quantity)
    if (groupBuyId) {
      form.value.group_buy_id = parseInt(groupBuyId)
    }
    
    product.value = await getProductDetail(productId)
    price.value = route.state?.price || product.value.group_price
    
    const points = await getPublicPickupPoints()
    pickupPoints.value = points
    
    if (points.length > 0) {
      const defaultPickup = pickupPointId 
        ? points.find(p => p.id === pickupPointId) || points[0]
        : points[0]
      selectedPickup.value = defaultPickup
      form.value.pickup_point_id = defaultPickup.id
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function onPickupConfirm({ selectedOptions }) {
  const point = pickupPoints.value.find(p => p.id === selectedOptions[0].value)
  if (point) {
    selectedPickup.value = point
    form.value.pickup_point_id = point.id
  }
  showPickupPicker.value = false
}

async function handleSubmit() {
  if (!form.value.pickup_point_id) {
    showToast('请选择自提点')
    return
  }
  
  submitting.value = true
  try {
    const orderData = {
      product_id: Number(form.value.product_id),
      quantity: Number(form.value.quantity),
      pickup_point_id: Number(form.value.pickup_point_id),
      pickup_method: String(form.value.pickup_method),
      remark: form.value.remark || ''
    }
    if (form.value.group_buy_id) {
      orderData.group_buy_id = Number(form.value.group_buy_id)
    }
    
    const order = await createOrder(orderData)
    
    await payOrder(order.id, { payment_method: 'balance' })
    
    showSuccessToast('下单成功')
    router.replace({ path: `/order/${order.id}` })
  } catch (e) {
    console.error('下单失败:', e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  initData()
})
</script>

<style scoped lang="less">
.checkout-page {
  background: #f5f5f5;
  padding-bottom: 80px;
}

.loading {
  text-align: center;
  padding: 40px 0;
}

.pickup-info {
  text-align: right;
  font-size: 14px;
  
  .pickup-address {
    font-size: 12px;
    color: #969799;
    margin-top: 2px;
  }
}

.product-item {
  display: flex;
  width: 100%;
  
  .product-info {
    flex: 1;
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: normal;
      line-height: 1.4;
    }
    
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .price {
        font-size: 16px;
        color: #ee0a24;
        font-weight: bold;
      }
    }
  }
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  
  .total-price {
    .price {
      font-size: 20px;
      color: #ee0a24;
      font-weight: bold;
    }
  }
}
</style>