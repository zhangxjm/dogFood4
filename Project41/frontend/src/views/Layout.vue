<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <h2 style="margin: 0; color: white">会议室预约</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/booking">
          <el-icon><Calendar /></el-icon>
          <span>预约会议室</span>
        </el-menu-item>
        <el-menu-item index="/my-bookings">
          <el-icon><Document /></el-icon>
          <span>我的预约</span>
        </el-menu-item>
        <el-menu-item v-if="isAdmin" index="/rooms">
          <el-icon><OfficeBuilding /></el-icon>
          <span>会议室管理</span>
        </el-menu-item>
        <el-menu-item v-if="isAdmin" index="/approvals">
          <el-icon><Check /></el-icon>
          <span>预约审批</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="user-info">
          <span>欢迎，{{ userStore.userInfo?.name }}</span>
          <el-tag :type="isAdmin ? 'danger' : 'success'" size="small" style="margin-left: 10px">
            {{ isAdmin ? '管理员' : '普通用户' }}
          </el-tag>
          <el-button type="text" style="margin-left: 10px" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const isAdmin = computed(() => userStore.isAdmin)

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1f2d3d;
}

.el-menu-vertical-demo {
  border-right: none;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
}
</style>
