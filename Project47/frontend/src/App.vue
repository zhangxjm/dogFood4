<template>
  <el-container class="app-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h3>驾校管理系统</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/students">
          <el-icon><User /></el-icon>
          <span>学员管理</span>
        </el-menu-item>
        <el-menu-item index="/coaches">
          <el-icon><Avatar /></el-icon>
          <span>教练管理</span>
        </el-menu-item>
        <el-menu-item index="/reservations">
          <el-icon><Calendar /></el-icon>
          <span>预约管理</span>
        </el-menu-item>
        <el-menu-item index="/study-hours">
          <el-icon><Clock /></el-icon>
          <span>学时记录</span>
        </el-menu-item>
        <el-menu-item index="/exam-scores">
          <el-icon><Document /></el-icon>
          <span>考试成绩</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><TrendCharts /></el-icon>
          <span>统计报表</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span>{{ currentPageTitle }}</span>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  const titles = {
    '/dashboard': '仪表盘',
    '/students': '学员管理',
    '/coaches': '教练管理',
    '/reservations': '预约管理',
    '/study-hours': '学时记录',
    '/exam-scores': '考试成绩',
    '/statistics': '统计报表'
  }
  return titles[route.path] || '驾校管理系统'
})
</script>

<style scoped>
.app-container {
  height: 100vh;
}
.sidebar {
  background-color: #2c3e50;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-bottom: 1px solid #34495e;
}
.logo h3 {
  margin: 0;
  font-size: 18px;
}
.menu {
  border-right: none;
  background-color: #2c3e50;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  padding: 0 20px;
}
.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
