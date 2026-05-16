<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon><Document /></el-icon>
        <span>考勤系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><Timer /></el-icon>
          <span>考勤打卡</span>
        </el-menu-item>
        <el-menu-item index="/attendance">
          <el-icon><Calendar /></el-icon>
          <span>考勤记录</span>
        </el-menu-item>
        <el-menu-item index="/leave">
          <el-icon><Tickets /></el-icon>
          <span>请假申请</span>
        </el-menu-item>
        <el-menu-item index="/overtime">
          <el-icon><Clock /></el-icon>
          <span>加班登记</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>考勤统计</span>
        </el-menu-item>
        <el-menu-item index="/exceptions">
          <el-icon><Warning /></el-icon>
          <span>异常处理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h2>企业员工考勤管理系统</h2>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ currentUser?.name || '管理员' }}
            </span>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const currentUser = ref(null)

const activeMenu = computed(() => route.path)

const initDemoUser = async () => {
  try {
    const res = await axios.get('/api/users')
    if (res.data.length === 0) {
      await axios.post('/api/users', {
        employeeId: 'E001',
        name: '张三',
        email: 'zhangsan@example.com',
        department: '技术部',
        position: '工程师'
      })
    }
    const users = await axios.get('/api/users')
    currentUser.value = users.data[0]
    localStorage.setItem('userId', users.data[0]._id)
  } catch (error) {
    console.error('初始化用户失败', error)
  }
}

onMounted(() => {
  initDemoUser()
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.sidebar {
  background-color: #304156;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  gap: 8px;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.header-left h2 {
  margin: 0;
  color: #303133;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}
.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
