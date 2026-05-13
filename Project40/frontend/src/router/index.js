import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '../views/ProductList.vue'
import CategoryList from '../views/CategoryList.vue'

const routes = [
  {
    path: '/',
    redirect: '/products'
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductList
  },
  {
    path: '/categories',
    name: 'Categories',
    component: CategoryList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
