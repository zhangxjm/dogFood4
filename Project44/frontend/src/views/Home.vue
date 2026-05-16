<template>
  <div class="home-page">
    <van-nav-bar title="校园请假审批系统" />
    
    <div class="user-info">
      <div class="avatar">{{ user?.name?.charAt(0) }}</div>
      <div class="info">
        <div class="name">{{ user?.name }}</div>
        <div class="role">{{ user?.roleDesc }} {{ user?.className ? '- ' + user.className : '' }}</div>
      </div>
    </div>
    
    <van-grid :column-num="3" border>
      <van-grid-item
        v-for="item in menuItems"
        :key="item.path"
        :icon="item.icon"
        :text="item.text"
        @click="goTo(item.path)"
      />
    </van-grid>
    
    <van-cell-group inset title="快捷操作" style="margin-top: 20px;">
      <van-cell title="退出登录" is-link @click="logout" />
    </van-cell-group>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

const menuItems = computed(() => {
  const items = []
  if (user.value?.role === 'STUDENT') {
    items.push(
      { path: '/apply', icon: 'add-o', text: '请假申请' },
      { path: '/history', icon: 'clock-o', text: '请假历史' }
    )
  }
  if (user.value?.role === 'TEACHER_FIRST' || user.value?.role === 'TEACHER_SECOND') {
    items.push(
      { path: '/approve', icon: 'passed', text: '审批管理' },
      { path: '/statistics', icon: 'bar-chart-o', text: '请假统计' }
    )
  }
  return items
})

const goTo = (path) => {
  router.push(path)
}

const logout = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？'
    })
    localStorage.removeItem('user')
    router.replace('/login')
  } catch (error) {}
}
</script>

<style scoped>
.home-page {
  padding-bottom: 50px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  margin: 10px;
  border-radius: 12px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin-right: 15px;
}

.info .name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.info .role {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}
</style>
