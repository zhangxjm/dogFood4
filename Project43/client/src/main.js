import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import Vant from 'vant';
import 'vant/lib/index.css';
import App from './App.vue';
import OrderManagement from './views/OrderManagement.vue';
import ProductManagement from './views/ProductManagement.vue';
import Statistics from './views/Statistics.vue';

const routes = [
  { path: '/', redirect: '/orders' },
  { path: '/orders', component: OrderManagement },
  { path: '/products', component: ProductManagement },
  { path: '/statistics', component: Statistics },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.use(Vant);
app.mount('#app');
