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
    path: '/students/add',
    name: 'AddStudent',
    component: () => import('../views/StudentForm.vue')
  },
  {
    path: '/students/edit/:id',
    name: 'EditStudent',
    component: () => import('../views/StudentForm.vue')
  },
  {
    path: '/students/:id',
    name: 'StudentDetail',
    component: () => import('../views/StudentDetail.vue')
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/Courses.vue')
  },
  {
    path: '/courses/add',
    name: 'AddCourse',
    component: () => import('../views/CourseForm.vue')
  },
  {
    path: '/courses/edit/:id',
    name: 'EditCourse',
    component: () => import('../views/CourseForm.vue')
  },
  {
    path: '/student-courses/add/:studentId',
    name: 'AddStudentCourse',
    component: () => import('../views/StudentCourseForm.vue')
  },
  {
    path: '/payments/add/:studentId',
    name: 'AddPayment',
    component: () => import('../views/PaymentForm.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
