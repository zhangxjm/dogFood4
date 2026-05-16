import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Books from '../views/Books.vue'
import Readers from '../views/Readers.vue'
import Borrows from '../views/Borrows.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/books',
    name: 'Books',
    component: Books
  },
  {
    path: '/readers',
    name: 'Readers',
    component: Readers
  },
  {
    path: '/borrows',
    name: 'Borrows',
    component: Borrows
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
