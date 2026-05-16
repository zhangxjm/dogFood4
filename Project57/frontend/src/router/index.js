import { createRouter, createWebHistory } from 'vue-router'
import MovieList from '../views/MovieList.vue'
import MovieDetail from '../views/MovieDetail.vue'
import SeatSelection from '../views/SeatSelection.vue'
import OrderQuery from '../views/OrderQuery.vue'
import BoxOfficeStats from '../views/BoxOfficeStats.vue'
import AdminMovies from '../views/admin/AdminMovies.vue'
import AdminSchedules from '../views/admin/AdminSchedules.vue'

const routes = [
  { path: '/', name: 'MovieList', component: MovieList },
  { path: '/movie/:id', name: 'MovieDetail', component: MovieDetail },
  { path: '/schedule/:scheduleId/seats', name: 'SeatSelection', component: SeatSelection },
  { path: '/orders', name: 'OrderQuery', component: OrderQuery },
  { path: '/stats', name: 'BoxOfficeStats', component: BoxOfficeStats },
  { path: '/admin/movies', name: 'AdminMovies', component: AdminMovies },
  { path: '/admin/schedules', name: 'AdminSchedules', component: AdminSchedules }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
