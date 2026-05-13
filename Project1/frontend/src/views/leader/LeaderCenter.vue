<template>
  <div class="leader-center-page">
    <van-nav-bar title="团长中心" />
    
    <div class="leader-header">
      <div class="leader-info">
        <van-image
          round
          width="64"
          height="64"
          :src="userStore.user?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/user-active.png'"
        />
        <div class="leader-text">
          <h3>{{ userStore.user?.username }}</h3>
          <p>累计佣金：¥{{ leaderProfile?.total_commission || 0 }}</p>
        </div>
      </div>
    </div>
    
    <van-grid :column-num="4" class="action-grid">
      <van-grid-item icon="shopping-cart-o" text="商品管理" @click="$router.push('/leader/products')" />
      <van-grid-item icon="location-o" text="自提点" @click="$router.push('/leader/pickup')" />
      <van-grid-item icon="orders-o" text="订单管理" @click="$router.push('/leader/orders')" />
      <van-grid-item icon="qr" text="订单核销" @click="$router.push('/leader/verify')" />
    </van-grid>
    
    <van-cell-group inset class="quick-stats">
      <van-cell title="我的商品" :value="productCount" is-link @click="$router.push('/leader/products')" />
      <van-cell title="我的自提点" :value="pickupCount" is-link @click="$router.push('/leader/pickup')" />
    </van-cell-group>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getLeaderProfile, createLeaderProfile } from '@/api/auth'
import { getMyProducts } from '@/api/products'
import { getMyPickupPoints } from '@/api/pickup'

const router = useRouter()
const userStore = useUserStore()

const leaderProfile = ref(null)
const productCount = ref(0)
const pickupCount = ref(0)

async function fetchData() {
  try {
    const profileRes = await getLeaderProfile()
    leaderProfile.value = profileRes.results?.[0] || profileRes[0]
    
    const productsRes = await getMyProducts()
    productCount.value = productsRes.count || productsRes.length
    
    const pickupRes = await getMyPickupPoints()
    pickupCount.value = pickupRes.length
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="less">
.leader-center-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.leader-header {
  padding: 30px 20px;
  background: linear-gradient(135deg, #1989fa 0%, #5fb7ff 100%);
  
  .leader-info {
    display: flex;
    align-items: center;
    color: #fff;
    
    .leader-text {
      margin-left: 16px;
      
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
}

.action-grid {
  background: #fff;
}

.quick-stats {
  margin-top: 12px;
}
</style>