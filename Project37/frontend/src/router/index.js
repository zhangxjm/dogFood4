import { createRouter, createWebHistory } from 'vue-router'
import ItemList from '../views/ItemList.vue'
import ItemDetail from '../views/ItemDetail.vue'
import ItemForm from '../views/ItemForm.vue'

const routes = [
  {
    path: '/',
    name: 'ItemList',
    component: ItemList
  },
  {
    path: '/item/:id',
    name: 'ItemDetail',
    component: ItemDetail
  },
  {
    path: '/add',
    name: 'AddItem',
    component: ItemForm
  },
  {
    path: '/edit/:id',
    name: 'EditItem',
    component: ItemForm
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
