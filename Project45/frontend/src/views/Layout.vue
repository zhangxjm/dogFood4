<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <el-icon><Wallet /></el-icon>
        <span>仓库管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据概览</template>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <template #title>商品档案</template>
        </el-menu-item>
        <el-menu-item index="/inbound">
          <el-icon><Download /></el-icon>
          <template #title>入库登记</template>
        </el-menu-item>
        <el-menu-item index="/outbound">
          <el-icon><Upload /></el-icon>
          <template #title>出库登记</template>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon><Box /></el-icon>
          <template #title>库存查询</template>
        </el-menu-item>
        <el-menu-item index="/alerts">
          <el-icon><Bell /></el-icon>
          <template #title>
            库存预警
            <el-badge v-if="unreadCount > 0" :value="unreadCount" class="menu-badge" />
          </template>
        </el-menu-item>
        <el-menu-item index="/records">
          <el-icon><Document /></el-icon>
          <template #title>出入库记录</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">{{ currentTitle }}</div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="User" />
              <span class="username">管理员</span>
            </span>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getUnreadAlertCount } from '@/api/alert'

const route = useRoute()
const unreadCount = ref(0)

const activeMenu = computed(() => route.path)

const currentTitle = computed(() => {
  const titleMap = {
    '/dashboard': '数据概览',
    '/products': '商品档案',
    '/inbound': '入库登记',
    '/outbound': '出库登记',
    '/inventory': '库存查询',
    '/alerts': '库存预警',
    '/records': '出入库记录'
  }
  return titleMap[route.path] || '仓库管理系统'
})

const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadAlertCount()
    unreadCount.value = res.unread_count
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchUnreadCount()
  setInterval(fetchUnreadCount, 30000)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #2b3a4a;
  gap: 8px;
}

.logo .el-icon {
  font-size: 24px;
}

.el-menu {
  border-right: none;
}

.menu-badge {
  margin-left: 8px;
}

.header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e6e6e6;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  color: #606266;
}

.main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow: auto;
}
</style>
