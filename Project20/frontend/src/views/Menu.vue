<template>
  <div class="menu-page">
    <div class="page-header">
      <h1>🥤 奶茶店</h1>
    </div>

    <div class="category-tabs">
      <div class="tabs-scroll">
        <span 
          v-for="category in categories" 
          :key="category"
          class="tab-item"
          :class="{ active: activeCategory === category }"
          @click="selectCategory(category)"
        >
          {{ category }}
        </span>
      </div>
    </div>

    <div class="drinks-list">
      <div 
        v-for="drink in filteredDrinks" 
        :key="drink.id" 
        class="drink-card"
        @click="showOptions(drink)"
      >
        <div class="drink-info">
          <div class="drink-name">{{ drink.name }}</div>
          <div class="drink-desc">{{ drink.description }}</div>
          <div class="drink-price">¥{{ drink.price }}</div>
        </div>
        <div class="drink-action">
          <div class="add-btn" @click.stop="quickAdd(drink)">+</div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">{{ selectedDrink?.name }}</div>
          <div class="modal-price">¥{{ selectedDrink?.price }}</div>
        </div>
        
        <div class="option-section">
          <div class="option-title">糖度</div>
          <div class="option-list">
            <span 
              v-for="item in sugarOptions" 
              :key="item.value"
              class="option-item"
              :class="{ active: selectedSugar === item.value }"
              @click="selectedSugar = item.value"
            >
              {{ item.label }}
            </span>
          </div>
        </div>
        
        <div class="option-section">
          <div class="option-title">冰度</div>
          <div class="option-list">
            <span 
              v-for="item in iceOptions" 
              :key="item.value"
              class="option-item"
              :class="{ active: selectedIce === item.value }"
              @click="selectedIce = item.value"
            >
              {{ item.label }}
            </span>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="confirm-btn" @click="addToCart">加入购物车</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDrinks } from '../api/index'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()

const drinks = ref([])
const categories = ref(['全部'])
const activeCategory = ref('全部')
const showModal = ref(false)
const selectedDrink = ref(null)
const selectedSugar = ref('normal')
const selectedIce = ref('normal')

const sugarOptions = [
  { label: '无糖', value: 'none' },
  { label: '少糖', value: 'less' },
  { label: '正常', value: 'normal' },
  { label: '多糖', value: 'more' }
]

const iceOptions = [
  { label: '去冰', value: 'none' },
  { label: '少冰', value: 'less' },
  { label: '正常', value: 'normal' },
  { label: '多冰', value: 'more' }
]

const filteredDrinks = computed(() => {
  if (activeCategory.value === '全部') {
    return drinks.value
  }
  return drinks.value.filter(drink => drink.category === activeCategory.value)
})

const selectCategory = (category) => {
  activeCategory.value = category
}

const quickAdd = (drink) => {
  cartStore.addItem(drink)
  alert('已加入购物车')
}

const showOptions = (drink) => {
  selectedDrink.value = drink
  selectedSugar.value = 'normal'
  selectedIce.value = 'normal'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedDrink.value = null
}

const addToCart = () => {
  if (selectedDrink.value) {
    cartStore.addItem(selectedDrink.value, {
      sugar: selectedSugar.value,
      ice: selectedIce.value
    })
    closeModal()
    alert('已加入购物车')
  }
}

const loadDrinks = async () => {
  try {
    const res = await getDrinks()
    drinks.value = res.data
    const categorySet = new Set(['全部'])
    res.data.forEach(drink => {
      categorySet.add(drink.category)
    })
    categories.value = Array.from(categorySet)
  } catch (error) {
    console.error('加载饮品失败:', error)
  }
}

onMounted(() => {
  loadDrinks()
})
</script>

<style scoped>
.menu-page {
  padding-bottom: 20px;
}

.page-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  padding: 30px 20px;
  color: #fff;
}

.page-header h1 {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

.category-tabs {
  background-color: #fff;
  padding: 15px 0;
  overflow-x: auto;
  white-space: nowrap;
}

.tabs-scroll {
  padding: 0 15px;
}

.tab-item {
  display: inline-block;
  padding: 8px 20px;
  margin-right: 12px;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  background-color: #f5f5f5;
  cursor: pointer;
}

.tab-item.active {
  background-color: #ff6b6b;
  color: #fff;
}

.drinks-list {
  padding: 15px;
}

.drink-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 20px;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.drink-info {
  flex: 1;
}

.drink-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.drink-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.drink-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b6b;
}

.drink-action {
  margin-left: 15px;
}

.add-btn {
  width: 40px;
  height: 40px;
  background-color: #ff6b6b;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  padding: 25px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.modal-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff6b6b;
}

.option-section {
  margin-bottom: 25px;
}

.option-title {
  font-size: 15px;
  color: #666;
  margin-bottom: 15px;
}

.option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.option-item {
  padding: 10px 20px;
  background-color: #f5f5f5;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.option-item.active {
  background-color: #ff6b6b;
  color: #fff;
}

.modal-footer {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #ff6b6b;
  color: #fff;
}
</style>
