import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/booking'
      },
      {
        path: 'booking',
        name: 'Booking',
        component: () => import('../views/Booking.vue')
      },
      {
        path: 'my-bookings',
        name: 'MyBookings',
        component: () => import('../views/MyBookings.vue')
      },
      {
        path: 'rooms',
        name: 'Rooms',
        component: () => import('../views/Rooms.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'approvals',
        name: 'Approvals',
        component: () => import('../views/Approvals.vue'),
        meta: { requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ path: '/booking' })
    return
  }

  if (to.path === '/login' && userStore.isLoggedIn) {
    next({ path: '/booking' })
    return
  }

  next()
})

export default router
