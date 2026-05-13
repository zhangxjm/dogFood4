<template>
  <el-container style="height: 100vh">
    <el-header style="background: #409EFF; color: white; display: flex; align-items: center; padding: 0 20px">
      <h2 style="margin: 0; font-size: 20px">宿舍管理系统</h2>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        background-color="#409EFF"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
        style="margin-left: 20px; flex: 1"
      >
        <el-menu-item index="/rooms">宿舍信息</el-menu-item>
        <el-menu-item index="/residents">住宿名单</el-menu-item>
        <el-menu-item index="/utilities">水电费管理</el-menu-item>
      </el-menu>
    </el-header>
    <el-main style="padding: 20px; background: #f5f5f5">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
}
</style>
