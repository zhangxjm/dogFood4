<template>
  <div class="leader-products-page">
    <van-nav-bar title="商品管理">
      <template #right>
        <van-button type="primary" size="small" @click="$router.push('/leader/product/create')">
          发布
        </van-button>
      </template>
    </van-nav-bar>
    
    <van-tabs v-model:active="activeStatus">
      <van-tab title="全部" />
      <van-tab title="上架中" />
      <van-tab title="已下架" />
    </van-tabs>
    
    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="products.length === 0" description="暂无商品" />
    
    <div class="product-list">
      <van-card
        v-for="product in products"
        :key="product.id"
        :thumb="product.image || 'https://fastly.jsdelivr.net/npm/@vant/assets/leaf.jpeg'"
        :title="product.name"
        :price="product.group_price"
        :origin-price="product.original_price"
        @click="goEdit(product.id)"
      >
        <template #footer>
          <div class="product-footer">
            <van-tag :type="product.status === 'up' ? 'success' : 'default'">
              {{ product.status === 'up' ? '上架中' : '已下架' }}
            </van-tag>
            <div class="actions">
              <van-button
                v-if="product.status === 'up'"
                size="mini"
                type="warning"
                @click.stop="toggleStatus(product, 'down')"
              >
                下架
              </van-button>
              <van-button
                v-else
                size="mini"
                type="success"
                @click.stop="toggleStatus(product, 'up')"
              >
                上架
              </van-button>
              <van-button size="mini" @click.stop="goEdit(product.id)">
                编辑
              </van-button>
            </div>
          </div>
        </template>
      </van-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import { getMyProducts, upProduct, downProduct } from '@/api/products'

const router = useRouter()
const activeStatus = ref(0)
const products = ref([])
const loading = ref(false)

const statusMap = ['', 'up', 'down']

async function fetchProducts() {
  loading.value = true
  try {
    const status = statusMap[activeStatus.value]
    let res = await getMyProducts(status ? { status } : {})
    products.value = res.results || res
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function toggleStatus(product, action) {
  try {
    if (action === 'up') {
      await upProduct(product.id)
      showSuccessToast('上架成功')
    } else {
      await downProduct(product.id)
      showSuccessToast('下架成功')
    }
    fetchProducts()
  } catch (e) {
    console.error(e)
  }
}

function goEdit(id) {
  router.push(`/leader/product/edit/${id}`)
}

watch(activeStatus, () => {
  fetchProducts()
})

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped lang="less">
.leader-products-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.loading {
  text-align: center;
  padding: 40px 0;
}

.product-list {
  padding: 12px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .actions {
    display: flex;
    gap: 8px;
  }
}
</style>