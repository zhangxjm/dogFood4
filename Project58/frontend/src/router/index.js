import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories.vue'),
        meta: { roles: [3] }
      },
      {
        path: 'supplies',
        name: 'Supplies',
        component: () => import('@/views/Supplies.vue')
      },
      {
        path: 'applications',
        name: 'Applications',
        component: () => import('@/views/Applications.vue')
      },
      {
        path: 'approval',
        name: 'Approval',
        component: () => import('@/views/Approval.vue'),
        meta: { roles: [2, 3] }
      },
      {
        path: 'stock-records',
        name: 'StockRecords',
        component: () => import('@/views/StockRecords.vue'),
        meta: { roles: [2, 3] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token
  const user = userStore.user

  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else if (to.meta.roles && user) {
    if (!to.meta.roles.includes(user.role)) {
      ElMessage.error('无权限访问')
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
