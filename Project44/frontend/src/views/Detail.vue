<template>
  <div class="detail-page">
    <van-nav-bar title="请假详情" left-text="返回" left-arrow @click-left="() => router.back()" />
    
    <van-loading v-if="loading" style="margin-top: 50px;" />
    
    <template v-else-if="leave">
      <van-cell-group inset>
        <van-cell title="学生姓名" :value="leave.student.name" />
        <van-cell title="班级" :value="leave.student.className" />
        <van-cell title="请假类型" :value="getLeaveTypeText(leave.leaveType)" />
        <van-cell title="开始日期" :value="leave.startDate" />
        <van-cell title="结束日期" :value="leave.endDate" />
        <van-cell title="请假天数" :value="leave.days + ' 天'" />
        <van-cell title="请假原因" :value="leave.reason" />
        <van-cell title="当前状态">
          <template #value>
            <van-tag :type="getStatusTagType(leave.status)">
              {{ getStatusText(leave.status) }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset title="审批流程">
        <van-cell title="一级审批">
          <template #value>
            <div v-if="leave.firstApprover">
              <div>{{ leave.firstApprover.name }}</div>
              <div style="font-size: 12px; color: #999;">{{ leave.firstApproveComment || '无意见' }}</div>
              <div style="font-size: 12px; color: #999;">{{ leave.firstApproveTime }}</div>
            </div>
            <van-tag v-else type="warning">待审批</van-tag>
          </template>
        </van-cell>
        <van-cell title="二级审批">
          <template #value>
            <div v-if="leave.secondApprover">
              <div>{{ leave.secondApprover.name }}</div>
              <div style="font-size: 12px; color: #999;">{{ leave.secondApproveComment || '无意见' }}</div>
              <div style="font-size: 12px; color: #999;">{{ leave.secondApproveTime }}</div>
            </div>
            <van-tag v-else-if="leave.status === 'PENDING_SECOND'" type="warning">待审批</van-tag>
            <van-tag v-else-if="leave.status === 'PENDING_FIRST'" type="default">未开始</van-tag>
            <van-tag v-else type="default">无需审批</van-tag>
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset title="申请信息">
        <van-cell title="申请时间" :value="leave.createdAt" />
        <van-cell v-if="leave.updatedAt" title="更新时间" :value="leave.updatedAt" />
      </van-cell-group>
    </template>
    
    <van-empty v-else description="加载失败" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getLeaveDetail } from '../api'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const leave = ref(null)

const getStatusText = (status) => {
  const map = {
    'PENDING_FIRST': '待一级审批',
    'PENDING_SECOND': '待二级审批',
    'APPROVED': '已通过',
    'REJECTED': '已驳回'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    'PENDING_FIRST': 'warning',
    'PENDING_SECOND': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger'
  }
  return map[status] || 'default'
}

const getLeaveTypeText = (type) => {
  if (!type) return '未知'
  if (typeof type === 'object') {
    return type.typeName || '未知'
  }
  const map = {
    'SICK': '病假',
    'PERSONAL': '事假',
    'ANNUAL': '年假',
    'OTHER': '其他'
  }
  return map[type] || type
}

onMounted(async () => {
  try {
    const res = await getLeaveDetail(route.params.id)
    if (res.success) {
      leave.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.detail-page {
  padding-bottom: 30px;
}
</style>
