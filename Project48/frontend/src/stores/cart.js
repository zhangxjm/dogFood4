import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const addItem = (product, sugarLevel = '正常糖', iceLevel = '正常冰') => {
    const existIndex = items.value.findIndex(item => 
      item.productId === product.id && 
      item.sugarLevel === sugarLevel && 
      item.iceLevel === iceLevel
    )

    if (existIndex > -1) {
      items.value[existIndex].quantity++
    } else {
      items.value.push({
        id: Date.now() + Math.random(),
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        sugarLevel,
        iceLevel,
        remark: ''
      })
    }
  }

  const updateQuantity = (itemId, quantity) => {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      item.quantity = quantity
    }
  }

  const removeItem = (itemId) => {
    const index = items.value.findIndex(i => i.id === itemId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const clearCart = () => {
    items.value = []
  }

  return {
    items,
    totalCount,
    totalAmount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  }
})
