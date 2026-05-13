import Home from '../views/Home.vue'
import Schedule from '../views/Schedule.vue'
import Technicians from '../views/Technicians.vue'
import TechnicianEdit from '../views/TechnicianEdit.vue'

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '排班表' }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: Schedule,
    meta: { title: '登记排班' }
  },
  {
    path: '/technicians',
    name: 'Technicians',
    component: Technicians,
    meta: { title: '技师管理' }
  },
  {
    path: '/technicians/new',
    name: 'TechnicianNew',
    component: TechnicianEdit,
    meta: { title: '添加技师' }
  },
  {
    path: '/technicians/:id',
    name: 'TechnicianEdit',
    component: TechnicianEdit,
    meta: { title: '编辑技师' }
  }
]
