<template>
  <div class="dishes-page">
    <van-nav-bar title="菜品管理" fixed>
      <template #right>
        <van-button type="primary" size="small" @click="goToCreate">添加菜品</van-button>
      </template>
    </van-nav-bar>
    <div class="content" :style="{ paddingTop: '46px', paddingBottom: '50px' }">
      <van-tabs v-model:active="activeTab" @change="onTabChange" sticky offset-top="46">
        <van-tab title="全部" :name="-1" />
        <van-tab v-for="cat in categories" :key="cat.id" :title="cat.name" :name="cat.id" />
      </van-tabs>

      <div class="filter-bar">
        <van-radio-group v-model="statusFilter" direction="horizontal" @change="loadDishes">
          <van-radio name="all">全部</van-radio>
          <van-radio name="true">上架中</van-radio>
          <van-radio name="false">已下架</van-radio>
        </van-radio-group>
      </div>

      <van-empty v-if="dishes.length === 0 && !loading" description="暂无菜品" />
      <van-loading v-if="loading" class="loading" />
      
      <van-list v-if="dishes.length > 0" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <van-cell-group inset>
          <van-cell v-for="dish in dishes" :key="dish.id" clickable @click="showDetail(dish)">
            <template #title>
              <div class="dish-title">
                <span :class="{ 'not-available': !dish.is_available }">{{ dish.name }}</span>
                <van-tag :type="dish.is_available ? 'success' : 'default'" size="mini">
                  {{ dish.is_available ? '上架中' : '已下架' }}
                </van-tag>
              </div>
            </template>
            <template #label>
              <div class="dish-info">
                <span class="price">¥{{ dish.price.toFixed(2) }}</span>
                <span class="category">{{ getCategoryName(dish.category_id) }}</span>
              </div>
              <div class="dish-desc" v-if="dish.description">{{ dish.description }}</div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>

      <van-popup v-model:show="showActions" position="bottom" :style="{ height: '50%' }">
        <van-action-sheet
          :actions="actions"
          @select="onActionSelect"
          cancel-text="取消"
          @cancel="showActions = false"
        />
      </van-popup>
    </div>

    <van-tabbar v-model="activeFooter">
      <van-tabbar-item icon="shop-o" to="/dishes">菜品</van-tabbar-item>
      <van-tabbar-item icon="apps-o" to="/categories">分类</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { dishApi, categoryApi } from '@/api'

const router = useRouter()
const activeTab = ref(-1)
const statusFilter = ref('all')
const dishes = ref([])
const categories = ref([])
const loading = ref(false)
const finished = ref(false)
const showActions = ref(false)
const selectedDish = ref(null)
const activeFooter = ref(0)

const actions = computed(() => [
  { name: selectedDish.value?.is_available ? '下架菜品' : '上架菜品', color: '#07c160' },
  { name: '修改价格', color: '#1989fa' },
  { name: '编辑菜品', color: '#ff976a' },
  { name: '删除菜品', color: '#ee0a24' }
])

const getCategoryName = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : '未分类'
}

const onTabChange = () => {
  dishes.value = []
  finished.value = false
  loadDishes()
}

const loadDishes = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const params = {}
    if (activeTab.value !== -1) {
      params.category_id = activeTab.value
    }
    if (statusFilter.value !== 'all') {
      params.is_available = statusFilter.value === 'true'
    }
    const res = await dishApi.list(params)
    dishes.value = res.data
    finished.value = true
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await categoryApi.list()
    categories.value = res.data
  } catch (e) {
    showToast('加载分类失败')
  }
}

const goToCreate = () => {
  router.push('/dishes/create')
}

const showDetail = (dish) => {
  selectedDish.value = dish
  showActions.value = true
}

const onActionSelect = (action, index) => {
  showActions.value = false
  switch (index) {
    case 0:
      toggleAvailable()
      break
    case 1:
      editPrice()
      break
    case 2:
      editDish()
      break
    case 3:
      deleteDish()
      break
  }
}

const toggleAvailable = async () => {
  try {
    await dishApi.update(selectedDish.value.id, {
      is_available: !selectedDish.value.is_available
    })
    showToast(selectedDish.value.is_available ? '已下架' : '已上架')
    loadDishes()
  } catch (e) {
    showToast('操作失败')
  }
}

const editPrice = () => {
  const originalPrice = selectedDish.value.price
  const input = prompt('请输入新价格', originalPrice)
  if (input === null) return
  const newPrice = parseFloat(input)
  if (isNaN(newPrice) || newPrice <= 0) {
    showToast('请输入有效价格')
    return
  }
  updatePrice(newPrice)
}

const updatePrice = async (newPrice) => {
  try {
    await dishApi.update(selectedDish.value.id, { price: newPrice })
    showToast('价格已更新')
    loadDishes()
  } catch (e) {
    showToast('操作失败')
  }
}

const editDish = () => {
  router.push(`/dishes/edit/${selectedDish.value.id}`)
}

const deleteDish = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除「${selectedDish.value.name}」吗？`
    })
    await dishApi.delete(selectedDish.value.id)
    showToast('删除成功')
    loadDishes()
  } catch (e) {
    if (e !== 'cancel') showToast('删除失败')
  }
}

const onLoad = () => {
}

onMounted(() => {
  loadCategories().then(loadDishes)
})
</script>

<style scoped>
.dishes-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  min-height: 100vh;
}

.filter-bar {
  padding: 12px 16px;
  background: #fff;
  margin-bottom: 12px;
}

.loading {
  text-align: center;
  padding: 20px;
}

.dish-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dish-title .not-available {
  color: #969799;
  text-decoration: line-through;
}

.dish-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.dish-info .price {
  color: #ee0a24;
  font-weight: bold;
  font-size: 16px;
}

.dish-info .category {
  color: #969799;
  font-size: 12px;
}

.dish-desc {
  color: #646566;
  font-size: 12px;
  margin-top: 4px;
}
</style>
