<template>
  <div class="product-detail-page">
    <van-nav-bar title="商品详情" left-arrow @click-left="router.back()" />
    
    <van-loading v-if="loading" style="margin-top: 100px" />
    <template v-else>
      <van-swipe class="product-swipe" :autoplay="0">
        <van-swipe-item>
          <van-image 
            :src="product?.image || defaultImage" 
            fit="cover" 
            width="100%" 
            height="300px"
          />
        </van-swipe-item>
      </van-swipe>
      
      <van-cell-group inset>
        <van-cell center>
          <template #default>
            <div class="product-header">
              <div class="price-row">
                <span class="group-price">¥{{ product?.group_price }}</span>
                <span class="original-price">¥{{ product?.original_price }}</span>
              </div>
              <div class="product-name">{{ product?.name }}</div>
              <div class="product-meta">
                <span>库存{{ product?.stock }}件</span>
                <span>已售{{ product?.sold_count || 0 }}件</span>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset title="商品详情">
        <van-cell>
          <template #default>
            <div class="product-desc" v-html="product?.description || '暂无商品描述'"></div>
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset v-if="groupBuy">
        <van-cell title="团购活动" :value="groupBuy.title" />
        <van-cell title="团购价" :value="`¥${groupBuy.group_price}`" />
        <van-cell title="成团进度" :value="`${groupBuy.current_people}/${groupBuy.min_group_size}人`" />
      </van-cell-group>
      
      <div class="buy-bar safe-area-bottom">
        <div class="stepper-wrap">
          <span>数量</span>
          <van-stepper v-model="quantity" :min="1" :max="product?.stock || 99" />
        </div>
        <van-button type="primary" round size="large" @click="buyNow">
          立即购买
        </van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getProductDetail } from '@/api/products'
import { getGroupDetail } from '@/api/groups'
import { getPublicPickupPoints } from '@/api/pickup'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const product = ref(null)
const groupBuy = ref(null)
const quantity = ref(1)
const pickupPoints = ref([])

const defaultImage = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'

const finalPrice = computed(() => {
  if (groupBuy.value) {
    return groupBuy.value.group_price
  }
  return product.value?.group_price || 0
})

async function fetchProduct() {
  loading.value = true
  try {
    const id = route.params.id
    product.value = await getProductDetail(id)
    
    const groupBuyId = route.query.group_buy_id
    if (groupBuyId) {
      groupBuy.value = await getGroupDetail(groupBuyId)
    }
    
    const points = await getPublicPickupPoints()
    pickupPoints.value = points
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function buyNow() {
  if (pickupPoints.value.length === 0) {
    showToast('暂无可用自提点')
    return
  }
  
  const state = {
    product: product.value,
    quantity: quantity.value,
    groupBuyId: groupBuy.value?.id,
    price: finalPrice.value,
    totalPrice: finalPrice.value * quantity.value,
    pickupPointId: pickupPoints.value[0].id
  }
  router.push({ path: '/checkout', state })
}

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped lang="less">
.product-detail-page {
  background: #f5f5f5;
  padding-bottom: 70px;
}

.product-swipe {
  height: 300px;
  background: #fff;
}

.product-header {
  width: 100%;
}

.price-row {
  margin-bottom: 8px;
}

.group-price {
  font-size: 24px;
  font-weight: bold;
  color: #ff6034;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-left: 8px;
}

.product-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
}

.product-meta {
  font-size: 12px;
  color: #999;
  span {
    margin-right: 16px;
  }
}

.product-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.buy-bar {
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
  z-index: 100;
}

.stepper-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
</style>
