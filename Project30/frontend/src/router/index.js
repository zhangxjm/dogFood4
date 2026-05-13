import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Category from '../views/Category.vue'
import Item from '../views/Item.vue'
import Employee from '../views/Employee.vue'
import Requisition from '../views/Requisition.vue'
import RequisitionRecord from '../views/RequisitionRecord.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/category',
    name: 'Category',
    component: Category,
    meta: { title: '物品分类' }
  },
  {
    path: '/item',
    name: 'Item',
    component: Item,
    meta: { title: '物品库存' }
  },
  {
    path: '/employee',
    name: 'Employee',
    component: Employee,
    meta: { title: '员工管理' }
  },
  {
    path: '/requisition',
    name: 'Requisition',
    component: Requisition,
    meta: { title: '物品申领' }
  },
  {
    path: '/requisition-record',
    name: 'RequisitionRecord',
    component: RequisitionRecord,
    meta: { title: '申领记录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title + ' - 办公用品申领系统'
  next()
})

export default router
