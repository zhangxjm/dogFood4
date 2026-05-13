<template>
  <el-container class="app-container">
    <el-header class="header">
      <h1>班级学生管理系统</h1>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        class="menu"
        router
      >
        <el-menu-item index="/students">学生管理</el-menu-item>
        <el-menu-item index="/classes">班级管理</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="main">
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

<style scoped>
.app-container {
  min-height: 100vh;
}
.header {
  display: flex;
  align-items: center;
  background-color: #409eff;
  color: white;
  padding: 0 20px;
}
.header h1 {
  margin: 0;
  font-size: 24px;
}
.menu {
  margin-left: 40px;
  background-color: transparent;
  border-bottom: none;
}
.menu :deep(.el-menu-item) {
  color: white;
}
.menu :deep(.el-menu-item:hover),
.menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2);
}
.main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
