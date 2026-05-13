import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/menu'
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('@/views/customer/Menu.vue')
  },
  {
    path: '/order-confirm',
    name: 'OrderConfirm',
    component: () => import('@/views/customer/OrderConfirm.vue')
  },
  {
    path: '/order-detail',
    name: 'OrderDetail',
    component: () => import('@/views/customer/OrderDetail.vue')
  },
  {
    path: '/payment',
    name: 'Payment',
    component: () => import('@/views/customer/Payment.vue')
  },
  {
    path: '/staff',
    name: 'Staff',
    component: () => import('@/views/staff/Index.vue')
  },
  {
    path: '/kitchen',
    name: 'Kitchen',
    component: () => import('@/views/kitchen/Index.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Index.vue')
  },
  {
    path: '/qrcode',
    name: 'QRCode',
    component: () => import('@/views/admin/QRCode.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
