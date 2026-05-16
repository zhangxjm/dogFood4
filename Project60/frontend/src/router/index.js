import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('../views/Students.vue')
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/Courses.vue')
  },
  {
    path: '/enroll',
    name: 'Enroll',
    component: () => import('../views/Enroll.vue')
  },
  {
    path: '/records',
    name: 'Records',
    component: () => import('../views/Records.vue')
  },
  {
    path: '/teachers',
    name: 'Teachers',
    component: () => import('../views/Teachers.vue')
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('../views/Payments.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
