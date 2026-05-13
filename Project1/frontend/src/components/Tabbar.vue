<template>
  <van-tabbar v-model="active" route fixed border placeholder>
    <van-tabbar-item replace to="/home" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item replace to="/groups" icon="shopping-cart-o">团购</van-tabbar-item>
    <van-tabbar-item replace to="/orders" icon="orders-o">订单</van-tabbar-item>
    <van-tabbar-item replace to="/mine" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)

const tabMap = {
  '/home': 0,
  '/groups': 1,
  '/orders': 2,
  '/mine': 3
}

watch(() => route.path, (newPath) => {
  active.value = tabMap[newPath] ?? 0
}, { immediate: true })
</script>
