import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Vant from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import './style.css'

import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import ProductDetail from './views/ProductDetail.vue'
import Publish from './views/Publish.vue'
import Favorites from './views/Favorites.vue'
import SellerCenter from './views/SellerCenter.vue'
import Transactions from './views/Transactions.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/product/:id', component: ProductDetail },
  { path: '/publish', component: Publish },
  { path: '/favorites', component: Favorites },
  { path: '/seller', component: SellerCenter },
  { path: '/transactions', component: Transactions }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.use(Vant)
app.mount('#app')
