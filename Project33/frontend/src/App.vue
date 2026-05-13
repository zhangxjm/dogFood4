<template>
  <div class="app">
    <router-view />
    <van-tabbar v-model="activeTab" route fixed>
      <van-tabbar-item to="/" icon="home-o">排班表</van-tabbar-item>
      <van-tabbar-item to="/schedule" icon="plus-circle-o">登记排班</van-tabbar-item>
      <van-tabbar-item to="/technicians" icon="friends-o">技师管理</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeTab = ref(0)

watch(
  () => route.path,
  (path) => {
    if (path === '/' || path === '') activeTab.value = 0
    else if (path === '/schedule') activeTab.value = 1
    else if (path === '/technicians') activeTab.value = 2
  },
  { immediate: true }
)
</script>

<style>
.app {
  min-height: 100vh;
}
</style>
