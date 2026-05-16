import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('../views/Members.vue')
  },
  {
    path: '/members/:id',
    name: 'MemberDetail',
    component: () => import('../views/MemberDetail.vue')
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: () => import('../views/Appointments.vue')
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('../views/Transactions.vue')
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: () => import('../views/Reminders.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router