<template>
  <div class="app-container">
    <router-view />
    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item to="/orders" icon="orders-o">订单管理</van-tabbar-item>
      <van-tabbar-item to="/products" icon="shop-o">商品管理</van-tabbar-item>
      <van-tabbar-item to="/statistics" icon="bar-chart-o">数据统计</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeTab = ref(0);
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f7f8fa;
}

.app-container {
  min-height: 100vh;
  padding-bottom: 50px;
}
</style>
