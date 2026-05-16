<template>
  <div class="approve-page">
    <van-nav-bar title="审批管理" left-text="返回" left-arrow @click-left="() => router.back()" />
    
    <van-tabs v-model:active="activeTab" swipeable>
      <van-tab v-if="user.role === 'TEACHER_FIRST'" title="待一级审批">
        <ApproveList type="first" />
      </van-tab>
      <van-tab v-if="user.role === 'TEACHER_SECOND'" title="待二级审批">
        <ApproveList type="second" />
      </van-tab>
      <van-tab title="已通过">
        <LeaveList :status="['APPROVED']" />
      </van-tab>
      <van-tab title="已驳回">
        <LeaveList :status="['REJECTED']" />
      </van-tab>
    </van-tabs>
    
    <div class="export-btn" @click="handleExport">
      <van-icon name="download" size="20" />
      <span>导出Excel</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LeaveList from '../components/LeaveList.vue'
import ApproveList from '../components/ApproveList.vue'
import { exportExcel } from '../api'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const activeTab = ref(0)

const handleExport = () => {
  exportExcel()
}
</script>

<style scoped>
.approve-page {
  height: 100vh;
}

.export-btn {
  position: fixed;
  right: 20px;
  bottom: 30px;
  padding: 12px 20px;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
