<template>
  <el-container class="app-container">
    <el-header>
      <div class="header-content">
        <h1>🍽️ 餐饮后厨叫号系统</h1>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          class="nav-menu"
        >
          <el-menu-item index="/order-entry">
            <el-icon><Edit /></el-icon>
            <span>订单录入</span>
          </el-menu-item>
          <el-menu-item index="/calling-display">
            <el-icon><Bell /></el-icon>
            <span>叫号显示</span>
          </el-menu-item>
          <el-menu-item index="/order-management">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <span>销售统计</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main>
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
}

.app-container {
  height: 100%;
}

.el-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  height: auto !important;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px 20px;
}

.header-content h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.nav-menu {
  background: transparent;
  border: none;
}

.nav-menu .el-menu-item {
  color: white;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-menu-item.is-active {
  background: rgba(255, 255, 255, 0.2);
}

.el-main {
  background: #f5f7fa;
  padding: 20px;
}
</style>
