import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/packages',
    name: 'Packages',
    component: () => import('../views/Packages.vue')
  },
  {
    path: '/pets',
    name: 'Pets',
    component: () => import('../views/Pets.vue')
  },
  {
    path: '/reservations',
    name: 'Reservations',
    component: () => import('../views/Reservations.vue')
  },
  {
    path: '/reviews',
    name: 'Reviews',
    component: () => import('../views/Reviews.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
