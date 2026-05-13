import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Vehicles from '../views/Vehicles.vue'
import Owners from '../views/Owners.vue'
import ParkingSpots from '../views/ParkingSpots.vue'

const routes = [
  { path: '/', component: Dashboard, name: 'Dashboard' },
  { path: '/vehicles', component: Vehicles, name: 'Vehicles' },
  { path: '/owners', component: Owners, name: 'Owners' },
  { path: '/parking-spots', component: ParkingSpots, name: 'ParkingSpots' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
