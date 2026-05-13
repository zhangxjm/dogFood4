<template>
  <div class="menu-page">
    <van-nav-bar title="扫码点餐" :arrow="false" class="fixed-nav">
      <template #left>
        <span v-if="cartStore.tableInfo" class="table-info">
          <van-icon name="shop-o" />
          {{ cartStore.tableInfo.tableName || cartStore.tableInfo.tableNo }}
        </span>
      </template>
      <template #right>
        <span @click="goHome" class="home-link">首页</span>
      </template>
    </van-nav-bar>

    <div class="select-table" v-if="!cartStore.tableInfo">
      <van-cell-group inset class="table-group">
        <van-cell title="请选择桌号" :value="selectedTableNo || '点击选择'" is-link @click="showTablePicker = true" />
      </van-cell-group>
    </div>

    <div class="menu-content" v-if="menuStore.categories.length > 0">
      <div class="category-sidebar">
        <div
          v-for="cat in menuStore.categories"
          :key="cat.id"
          :class="['category-item', { active: activeCategory === cat.id }]"
          @click="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </div>
      </div>
      
      <div class="dish-list" ref="dishListRef">
        <div v-for="cat in menuStore.categories" :key="'sec-' + cat.id" :data-id="cat.id" class="category-section">
          <div class="category-title">{{ cat.name }}</div>
          <div
            v-for="dish in menuStore.dishesByCategory[cat.id]"
            :key="dish.id"
            class="dish-item"
          >
            <div class="dish-info">
              <div class="dish-name">{{ dish.name }}</div>
              <div class="dish-desc" v-if="dish.description">{{ dish.description }}</div>
              <div class="dish-price">
                <span class="price">¥{{ dish.price }}</span>
              </div>
            </div>
            <div class="dish-action">
              <van-stepper
                :model-value="cartStore.getQuantity(dish.id)"
                :min="0"
                @plus="() => cartStore.addItem(dish)"
                @minus="() => cartStore.decreaseItem(dish)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <van-loading v-if="loading" type="spinner" class="loading" />

    <van-submit-bar
      v-if="cartStore.totalCount > 0"
      :price="parseFloat(cartStore.totalPrice) * 100"
      button-text="去结算"
      @submit="goConfirm"
    >
      <van-submit-bar-text>
        共 {{ cartStore.totalCount }} 件
      </van-submit-bar-text>
    </van-submit-bar>

    <van-popup v-model:show="showTablePicker" position="bottom">
      <van-picker
        :columns="tableColumns"
        title="选择桌号"
        @confirm="onTableConfirm"
        @cancel="showTablePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getTables } from '@/api'
import { useCartStore, useMenuStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const menuStore = useMenuStore()

const loading = ref(true)
const activeCategory = ref(null)
const dishListRef = ref(null)
const tables = ref([])
const showTablePicker = ref(false)
const selectedTableNo = ref('')
const tableColumns = ref([])

const loadTables = async () => {
  try {
    tables.value = await getTables()
    tableColumns.value = tables.value.map(t => ({ 
      text: `${t.tableNo} - ${t.tableName || ''}`, 
      value: t.tableNo 
    }))
  } catch (e) {
    console.error(e)
  }
}

const onTableConfirm = ({ selectedOptions }) => {
  const tableNo = selectedOptions[0].value
  const table = tables.value.find(t => t.tableNo === tableNo)
  if (table) {
    cartStore.setTable(table)
    selectedTableNo.value = table.tableNo
  }
  showTablePicker.value = false
}

const selectCategory = (id) => {
  activeCategory.value = id
  const section = dishListRef.value?.querySelector(`[data-id="${id}"]`)
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const goConfirm = () => {
  if (!cartStore.tableInfo) {
    showToast('请先选择桌号')
    showTablePicker.value = true
    return
  }
  router.push('/order-confirm')
}

const goHome = () => {
  cartStore.clearAll()
  router.push('/menu')
}

onMounted(async () => {
  await loadTables()
  
  const tableNo = route.query.tableNo
  if (tableNo) {
    const table = tables.value.find(t => t.tableNo === tableNo)
    if (table) {
      cartStore.setTable(table)
      selectedTableNo.value = table.tableNo
    }
  }
  
  await menuStore.loadData()
  
  if (menuStore.categories.length > 0) {
    activeCategory.value = menuStore.categories[0].id
  }
  loading.value = false
})
</script>

<style scoped lang="less">
.menu-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;
}

.fixed-nav {
  position: sticky;
  top: 0;
  z-index: 100;
}

.table-info {
  font-size: 12px;
  color: #666;
}

.home-link {
  color: #1989fa;
  font-size: 14px;
}

.select-table {
  padding: 10px;
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.menu-content {
  display: flex;
  height: calc(100vh - 46px - 50px);
}

.category-sidebar {
  width: 85px;
  background: #f7f8fa;
  overflow-y: auto;
  flex-shrink: 0;
  
  .category-item {
    padding: 16px 8px;
    text-align: center;
    font-size: 12px;
    color: #666;
    border-left: 3px solid transparent;
    
    &.active {
      background: #fff;
      color: #1989fa;
      font-weight: bold;
      border-left-color: #1989fa;
    }
  }
}

.dish-list {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}

.category-section {
  .category-title {
    padding: 10px 12px;
    background: #f5f5f5;
    font-size: 13px;
    color: #666;
    font-weight: bold;
  }
  
  .dish-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #eee;
    
    .dish-info {
      flex: 1;
      
      .dish-name {
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      
      .dish-desc {
        font-size: 12px;
        color: #999;
        margin-bottom: 6px;
      }
      
      .dish-price {
        .price {
          font-size: 16px;
        }
      }
    }
    
    .dish-action {
      flex-shrink: 0;
    }
  }
}
</style>
