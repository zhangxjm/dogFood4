<template>
  <div id="app">
    <router-view />
    <van-tabbar v-if="isLoggedIn" route>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="plus" to="/publish">发布</van-tabbar-item>
      <van-tabbar-item icon="star-o" to="/favorites">收藏</van-tabbar-item>
      <van-tabbar-item icon="shop-o" to="/seller">卖家中心</van-tabbar-item>
      <van-tabbar-item icon="orders-o" to="/transactions">交易</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user')
})
</script>
