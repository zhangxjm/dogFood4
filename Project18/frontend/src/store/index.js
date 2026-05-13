import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    cart: [],
    orders: [],
    API_BASE_URL: 'http://localhost:3000/api'
  },
  getters: {
    cartItems: state => state.cart,
    cartCount: state => state.cart.reduce((total, item) => total + item.quantity, 0),
    cartTotal: state => state.cart.reduce((total, item) => total + item.price * item.quantity, 0)
  },
  mutations: {
    ADD_TO_CART(state, product) {
      const existingItem = state.cart.find(item => item.id === product.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        state.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          quantity: 1
        })
      }
    },
    REMOVE_FROM_CART(state, productId) {
      const index = state.cart.findIndex(item => item.id === productId)
      if (index > -1) {
        state.cart.splice(index, 1)
      }
    },
    UPDATE_QUANTITY(state, { productId, quantity }) {
      const item = state.cart.find(item => item.id === productId)
      if (item) {
        item.quantity = quantity
      }
    },
    INCREASE_QUANTITY(state, productId) {
      const item = state.cart.find(item => item.id === productId)
      if (item) {
        item.quantity++
      }
    },
    DECREASE_QUANTITY(state, productId) {
      const item = state.cart.find(item => item.id === productId)
      if (item && item.quantity > 1) {
        item.quantity--
      } else if (item && item.quantity === 1) {
        const index = state.cart.findIndex(i => i.id === productId)
        if (index > -1) {
          state.cart.splice(index, 1)
        }
      }
    },
    CLEAR_CART(state) {
      state.cart = []
    }
  },
  actions: {
    addToCart({ commit }, product) {
      commit('ADD_TO_CART', product)
    },
    removeFromCart({ commit }, productId) {
      commit('REMOVE_FROM_CART', productId)
    },
    updateQuantity({ commit }, payload) {
      commit('UPDATE_QUANTITY', payload)
    },
    increaseQuantity({ commit }, productId) {
      commit('INCREASE_QUANTITY', productId)
    },
    decreaseQuantity({ commit }, productId) {
      commit('DECREASE_QUANTITY', productId)
    },
    clearCart({ commit }) {
      commit('CLEAR_CART')
    }
  }
})

export default store
