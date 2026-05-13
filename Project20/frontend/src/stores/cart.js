import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    tableNo: '',
    remark: ''
  }),
  
  getters: {
    totalCount: (state) => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    totalPrice: (state) => {
      return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }
  },
  
  actions: {
    addItem(drink, options = {}) {
      const existingIndex = this.items.findIndex(item => 
        item.drinkId === drink.id && 
        item.sugar === (options.sugar || 'normal') && 
        item.ice === (options.ice || 'normal')
      )
      
      if (existingIndex > -1) {
        this.items[existingIndex].quantity++
      } else {
        this.items.push({
          id: Date.now(),
          drinkId: drink.id,
          drinkName: drink.name,
          price: drink.price,
          quantity: 1,
          sugar: options.sugar || 'normal',
          ice: options.ice || 'normal'
        })
      }
    },
    
    removeItem(itemId) {
      this.items = this.items.filter(item => item.id !== itemId)
    },
    
    updateQuantity(itemId, quantity) {
      const item = this.items.find(item => item.id === itemId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(itemId)
        } else {
          item.quantity = quantity
        }
      }
    },
    
    clearCart() {
      this.items = []
      this.tableNo = ''
      this.remark = ''
    },
    
    setTableNo(tableNo) {
      this.tableNo = tableNo
    },
    
    setRemark(remark) {
      this.remark = remark
    },
    
    getOrderItems() {
      return this.items.map(item => ({
        drinkId: item.drinkId,
        drinkName: item.drinkName,
        price: item.price,
        quantity: item.quantity,
        sugar: item.sugar,
        ice: item.ice
      }))
    }
  }
})
