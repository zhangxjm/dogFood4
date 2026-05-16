import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('../views/Students.vue')
  },
  {
    path: '/coaches',
    name: 'Coaches',
    component: () => import('../views/Coaches.vue')
  },
  {
    path: '/reservations',
    name: 'Reservations',
    component: () => import('../views/Reservations.vue')
  },
  {
    path: '/study-hours',
    name: 'StudyHours',
    component: () => import('../views/StudyHours.vue')
  },
  {
    path: '/exam-scores',
    name: 'ExamScores',
    component: () => import('../views/ExamScores.vue')
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
