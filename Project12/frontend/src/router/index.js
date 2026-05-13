import { createRouter, createWebHistory } from 'vue-router'
import StudentList from '../views/StudentList.vue'
import ClassManagement from '../views/ClassManagement.vue'

const routes = [
  {
    path: '/',
    redirect: '/students'
  },
  {
    path: '/students',
    name: 'StudentList',
    component: StudentList
  },
  {
    path: '/classes',
    name: 'ClassManagement',
    component: ClassManagement
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
