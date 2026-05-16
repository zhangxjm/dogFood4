import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Department from '../views/Department.vue'
import Doctor from '../views/Doctor.vue'
import Schedule from '../views/Schedule.vue'
import Registration from '../views/Registration.vue'
import Record from '../views/Record.vue'
import Statistics from '../views/Statistics.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/departments', name: 'Department', component: Department },
  { path: '/doctors', name: 'Doctor', component: Doctor },
  { path: '/schedules', name: 'Schedule', component: Schedule },
  { path: '/registration', name: 'Registration', component: Registration },
  { path: '/records', name: 'Record', component: Record },
  { path: '/statistics', name: 'Statistics', component: Statistics }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
