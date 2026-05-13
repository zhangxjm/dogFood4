<template>
  <div class="app">
    <div class="content">
      <router-view />
    </div>
    <div class="tab-bar">
      <router-link to="/menu" class="tab-item" active-class="active">
        <span class="tab-icon">📋</span>
        <span class="tab-text">菜单</span>
      </router-link>
      <router-link to="/cart" class="tab-item" active-class="active">
        <span class="tab-icon">🛒</span>
        <span class="tab-text">购物车</span>
        <span v-if="cartStore.totalCount > 0" class="tab-badge">{{ cartStore.totalCount }}</span>
      </router-link>
      <router-link to="/orders" class="tab-item" active-class="active">
        <span class="tab-icon">📦</span>
        <span class="tab-text">订单</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from './stores/cart'

const cartStore = useCartStore()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}

.app {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
}

.content {
  padding-bottom: 70px;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 60px;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #999;
  position: relative;
  height: 100%;
}

.tab-item.active {
  color: #ff6b6b;
}

.tab-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.tab-text {
  font-size: 12px;
}

.tab-badge {
  position: absolute;
  top: 8px;
  right: 50%;
  transform: translateX(30px);
  background-color: #ff6b6b;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}
</style>
