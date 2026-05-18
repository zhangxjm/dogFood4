import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/apply',
    name: 'Apply',
    component: () => import('../views/Apply.vue'),
    meta: { requiresAuth: true, roles: ['STUDENT'] }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue'),
    meta: { requiresAuth: true, roles: ['STUDENT'] }
  },
  {
    path: '/approve',
    name: 'Approve',
    component: () => import('../views/Approve.vue'),
    meta: { requiresAuth: true, roles: ['TEACHER_FIRST', 'TEACHER_SECOND'] }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue'),
    meta: { requiresAuth: true, roles: ['TEACHER_FIRST', 'TEACHER_SECOND'] }
  },
  {
    path: '/leave-type-config',
    name: 'LeaveTypeConfig',
    component: () => import('../views/LeaveTypeConfig.vue'),
    meta: { requiresAuth: true, roles: ['TEACHER_FIRST', 'TEACHER_SECOND'] }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('../views/Detail.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.meta.roles && user && !to.meta.roles.includes(user.role)) {
    next('/')
  } else {
    next()
  }
})

export default router
