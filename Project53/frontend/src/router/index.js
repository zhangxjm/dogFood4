import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'CheckIn',
    component: () => import('../views/CheckIn.vue')
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: () => import('../views/AttendanceList.vue')
  },
  {
    path: '/leave',
    name: 'Leave',
    component: () => import('../views/LeaveList.vue')
  },
  {
    path: '/overtime',
    name: 'Overtime',
    component: () => import('../views/OvertimeList.vue')
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue')
  },
  {
    path: '/exceptions',
    name: 'Exceptions',
    component: () => import('../views/Exceptions.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
