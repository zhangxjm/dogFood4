import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCategories, getDishes } from '@/api'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])
  const tableInfo = ref(null)
  const currentOrder = ref(null)

  const totalCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  })

  const setTable = (table) => {
    tableInfo.value = table
  }

  const addItem = (dish) => {
    const existing = cartItems.value.find(item => item.id === dish.id)
    if (existing) {
      existing.quantity++
    } else {
      cartItems.value.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1
      })
    }
  }

  const decreaseItem = (dish) => {
    const existing = cartItems.value.find(item => item.id === dish.id)
    if (existing) {
      existing.quantity--
      if (existing.quantity <= 0) {
        cartItems.value = cartItems.value.filter(item => item.id !== dish.id)
      }
    }
  }

  const removeItem = (dishId) => {
    cartItems.value = cartItems.value.filter(item => item.id !== dishId)
  }

  const getQuantity = (dishId) => {
    const item = cartItems.value.find(item => item.id === dishId)
    return item ? item.quantity : 0
  }

  const clearCart = () => {
    cartItems.value = []
  }

  const setOrder = (order) => {
    currentOrder.value = order
  }

  const clearAll = () => {
    cartItems.value = []
    currentOrder.value = null
  }

  return {
    cartItems,
    tableInfo,
    currentOrder,
    totalCount,
    totalPrice,
    setTable,
    addItem,
    decreaseItem,
    removeItem,
    getQuantity,
    clearCart,
    setOrder,
    clearAll
  }
})

export const useMenuStore = defineStore('menu', () => {
  const categories = ref([])
  const dishes = ref([])
  const dishesByCategory = ref({})

  const loadData = async () => {
    try {
      const [cats, dishList] = await Promise.all([
        getCategories(),
        getDishes()
      ])
      categories.value = cats
      dishes.value = dishList
      
      dishesByCategory.value = {}
      cats.forEach(cat => {
        dishesByCategory.value[cat.id] = dishList.filter(d => d.categoryId === cat.id)
      })
    } catch (e) {
      console.error('加载菜单失败', e)
    }
  }

  return {
    categories,
    dishes,
    dishesByCategory,
    loadData
  }
})
