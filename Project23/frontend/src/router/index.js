import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/courses'
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/Courses.vue')
  },
  {
    path: '/reservations',
    name: 'Reservations',
    component: () => import('../views/Reservations.vue')
  },
  {
    path: '/admin/courses',
    name: 'AdminCourses',
    component: () => import('../views/AdminCourses.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
