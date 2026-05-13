import { createRouter, createWebHistory } from 'vue-router'
import Rooms from '../views/Rooms.vue'
import Residents from '../views/Residents.vue'
import Utilities from '../views/Utilities.vue'

const routes = [
  {
    path: '/',
    redirect: '/rooms'
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: Rooms
  },
  {
    path: '/residents',
    name: 'Residents',
    component: Residents
  },
  {
    path: '/utilities',
    name: 'Utilities',
    component: Utilities
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
