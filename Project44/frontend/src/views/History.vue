<template>
  <div class="history-page">
    <van-nav-bar title="请假历史" left-text="返回" left-arrow @click-left="() => router.back()" />
    
    <van-tabs v-model:active="activeTab" swipeable>
      <van-tab title="全部">
        <LeaveList :status="null" />
      </van-tab>
      <van-tab title="待审批">
        <LeaveList :status="['PENDING_FIRST', 'PENDING_SECOND']" />
      </van-tab>
      <van-tab title="已通过">
        <LeaveList :status="['APPROVED']" />
      </van-tab>
      <van-tab title="已驳回">
        <LeaveList :status="['REJECTED']" />
      </van-tab>
    </van-tabs>
    
    <div class="fab" @click="router.push('/apply')">
      <van-icon name="plus" size="24" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LeaveList from '../components/LeaveList.vue'

const router = useRouter()
const activeTab = ref(0)
</script>

<style scoped>
.history-page {
  height: 100vh;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
