import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dishes'
  },
  {
    path: '/dishes',
    name: 'Dishes',
    component: () => import('@/views/Dishes.vue')
  },
  {
    path: '/dishes/create',
    name: 'DishCreate',
    component: () => import('@/views/DishForm.vue')
  },
  {
    path: '/dishes/edit/:id',
    name: 'DishEdit',
    component: () => import('@/views/DishForm.vue')
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/Categories.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
