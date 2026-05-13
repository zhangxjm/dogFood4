<template>
  <div class="groups-page page-container">
    <van-nav-bar title="团购活动" />
    
    <div class="group-list">
      <van-loading v-if="loading" class="loading" />
      <van-empty v-else-if="groups.length === 0" description="暂无团购活动" />
      <van-cell
        v-for="group in groups"
        :key="group.id"
        clickable
        @click="goDetail(group)"
      >
        <div class="group-item">
          <div class="group-image">
            <van-image
              fit="cover"
              width="100"
              height="100"
              :src="group.product?.image || 'https://fastly.jsdelivr.net/npm/@vant/assets/leaf.jpeg'"
            />
          </div>
          <div class="group-info">
            <h4 class="group-title">{{ group.title }}</h4>
            <p class="group-product">{{ group.product?.name }}</p>
            <div class="group-price">
              <span class="price">¥{{ group.group_price }}</span>
              <span class="people">{{ group.current_people }}人已参团</span>
            </div>
            <div class="group-progress">
              <van-progress :percentage="Math.min((group.current_people / group.min_group_size) * 100, 100)" stroke-width="6" />
              <span class="progress-text">还差{{ Math.max(group.min_group_size - group.current_people, 0) }}人成团</span>
            </div>
          </div>
        </div>
      </van-cell>
    </div>
    
    <Tabbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getActiveGroups } from '@/api/groups'
import Tabbar from '@/components/Tabbar.vue'

const router = useRouter()
const groups = ref([])
const loading = ref(false)

onMounted(() => {
  fetchGroups()
})

async function fetchGroups() {
  loading.value = true
  try {
    const res = await getActiveGroups()
    groups.value = res.results || res
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function goDetail(group) {
  router.push({
    path: '/checkout',
    query: { productId: group.product.id, groupBuyId: group.id }
  })
}
</script>

<style scoped lang="less">
.groups-page {
  background: #f7f8fa;
}

.group-list {
  padding: 12px;
}

.loading {
  text-align: center;
  padding: 40px 0;
}

.group-item {
  display: flex;
  padding: 12px 0;
}

.group-image {
  flex-shrink: 0;
  margin-right: 12px;
}

.group-info {
  flex: 1;
  min-width: 0;
  
  h4 {
    margin: 0 0 4px;
    font-size: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .group-product {
    margin: 0 0 8px;
    font-size: 12px;
    color: #969799;
  }
  
  .group-price {
    display: flex;
    align-items: baseline;
    margin-bottom: 8px;
    
    .price {
      font-size: 18px;
      font-weight: bold;
      color: #ee0a24;
      margin-right: 12px;
    }
    
    .people {
      font-size: 12px;
      color: #969799;
    }
  }
  
  .group-progress {
    .progress-text {
      display: block;
      font-size: 12px;
      color: #969799;
      margin-top: 4px;
    }
  }
}
</style>
