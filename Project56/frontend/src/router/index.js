import { createRouter, createWebHistory } from 'vue-router'
import OrderEntry from '../views/OrderEntry.vue'
import CallingDisplay from '../views/CallingDisplay.vue'
import OrderManagement from '../views/OrderManagement.vue'
import Statistics from '../views/Statistics.vue'

const routes = [
  { path: '/', redirect: '/order-entry' },
  { path: '/order-entry', component: OrderEntry },
  { path: '/calling-display', component: CallingDisplay },
  { path: '/order-management', component: OrderManagement },
  { path: '/statistics', component: Statistics }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
