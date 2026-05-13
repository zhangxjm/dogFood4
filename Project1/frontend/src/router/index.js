import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', requiresAuth: true, showTabbar: true }
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('@/views/Groups.vue'),
    meta: { title: '团购', requiresAuth: true, showTabbar: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'),
    meta: { title: '订单', requiresAuth: true, showTabbar: true }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/Mine.vue'),
    meta: { title: '我的', requiresAuth: true, showTabbar: true }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: '商品详情', requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/Checkout.vue'),
    meta: { title: '确认下单', requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/leader',
    name: 'LeaderCenter',
    component: () => import('@/views/leader/LeaderCenter.vue'),
    meta: { title: '团长中心', requiresAuth: true, requiresLeader: true }
  },
  {
    path: '/leader/products',
    name: 'LeaderProducts',
    component: () => import('@/views/leader/LeaderProducts.vue'),
    meta: { title: '商品管理', requiresAuth: true, requiresLeader: true }
  },
  {
    path: '/leader/product/create',
    name: 'ProductCreate',
    component: () => import('@/views/leader/ProductCreate.vue'),
    meta: { title: '发布商品', requiresAuth: true, requiresLeader: true }
  },
  {
    path: '/leader/product/edit/:id',
    name: 'ProductEdit',
    component: () => import('@/views/leader/ProductEdit.vue'),
    meta: { title: '编辑商品', requiresAuth: true, requiresLeader: true }
  },
  {
    path: '/leader/pickup',
    name: 'LeaderPickup',
    component: () => import('@/views/leader/LeaderPickup.vue'),
    meta: { title: '自提点管理', requiresAuth: true, requiresLeader: true }
  },
  {
    path: '/leader/orders',
    name: 'LeaderOrders',
    component: () => import('@/views/leader/LeaderOrders.vue'),
    meta: { title: '订单管理', requiresAuth: true, requiresLeader: true }
  },
  {
    path: '/leader/verify',
    name: 'OrderVerify',
    component: () => import('@/views/leader/OrderVerify.vue'),
    meta: { title: '订单核销', requiresAuth: true, requiresLeader: true }
  },
  {
    path: '/leader/register',
    name: 'LeaderRegister',
    component: () => import('@/views/leader/LeaderRegister.vue'),
    meta: { title: '成为团长', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  document.title = to.meta.title || '社区团购'
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  if (to.meta.requiresLeader && !userStore.isLeader) {
    if (to.path !== '/leader/register') {
      next('/leader/register')
      return
    }
  }
  
  next()
})

export default router
