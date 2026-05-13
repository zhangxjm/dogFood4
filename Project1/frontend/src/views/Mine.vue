<template>
  <div class="mine-page page-container">
    <div class="user-header">
      <div class="user-info" @click="goProfile">
        <van-image
          round
          width="64"
          height="64"
          :src="userStore.user?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/user-active.png'"
        />
        <div class="user-text">
          <h3>{{ userStore.user?.username }}</h3>
          <p>{{ userStore.isLeader ? '团长' : '普通用户' }}</p>
        </div>
        <van-icon name="arrow" />
      </div>
    </div>
    
    <van-cell-group inset class="quick-actions">
      <van-cell title="我的订单" is-link @click="$router.push('/orders')" icon="orders-o" />
      <van-cell title="收货地址" is-link @click="goAddresses" icon="location-o" />
      <van-cell v-if="userStore.isLeader" title="团长中心" is-link @click="$router.push('/leader')" icon="manager-o" />
      <van-cell v-else title="成为团长" is-link @click="$router.push('/leader/register')" icon="plus-o" />
    </van-cell-group>
    
    <van-cell-group inset class="settings">
      <van-cell title="设置" is-link icon="setting-o" />
      <van-cell title="关于我们" is-link icon="info-o" />
    </van-cell-group>
    
    <div class="logout-btn">
      <van-button round block type="danger" plain @click="handleLogout">退出登录</van-button>
    </div>
    
    <Tabbar />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import Tabbar from '@/components/Tabbar.vue'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (userStore.isLoggedIn && !userStore.user) {
    userStore.fetchProfile()
  }
})

async function handleLogout() {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？'
    })
    userStore.logout()
    router.push('/login')
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

function goProfile() {
  // TODO: 个人资料页面
}

function goAddresses() {
  // TODO: 地址管理页面
}
</script>

<style scoped lang="less">
.mine-page {
  background: #f7f8fa;
}

.user-header {
  padding: 30px 20px;
  background: linear-gradient(135deg, #1989fa 0%, #5fb7ff 100%);
  
  .user-info {
    display: flex;
    align-items: center;
    
    .user-text {
      flex: 1;
      margin-left: 16px;
      color: #fff;
      
      h3 {
        margin: 0 0 4px;
        font-size: 18px;
      }
      
      p {
        margin: 0;
        font-size: 13px;
        opacity: 0.9;
      }
    }
    
    .van-icon {
      color: #fff;
    }
  }
}

.quick-actions, .settings {
  margin-top: 12px;
}

.logout-btn {
  padding: 20px;
}
</style>
