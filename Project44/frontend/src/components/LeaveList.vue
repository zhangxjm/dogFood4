<template>
  <div class="leave-list">
    <van-loading v-if="loading" style="margin-top: 50px;" />
    
    <van-empty v-if="!loading && list.length === 0" description="暂无数据" />
    
    <van-list
      v-else
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell-group inset style="margin-bottom: 10px;">
        <van-cell
          v-for="item in filteredList"
          :key="item.id"
          is-link
          @click="goToDetail(item.id)"
        >
          <template #title>
            <div class="leave-title">
              <span>{{ item.student?.name || '未知' }}</span>
              <van-tag :type="getStatusTagType(item.status)" size="small">
                {{ getStatusText(item.status) }}
              </van-tag>
            </div>
          </template>
          <template #value>
            <div class="leave-info">
              <div>{{ getLeaveTypeText(item.leaveType) }}</div>
              <div class="date">{{ item.startDate }} ~ {{ item.endDate }}</div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </van-list>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyLeaves, getApproved, getRejected } from '../api'

const props = defineProps({
  status: {
    type: [Array, null],
    default: null
  }
})

const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const list = ref([])

const user = JSON.parse(localStorage.getItem('user') || 'null')

const filteredList = computed(() => {
  if (!props.status) return list.value
  return list.value.filter(item => props.status.includes(item.status))
})

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
  const map = {
    'SICK': '病假',
    'PERSONAL': '事假',
    'ANNUAL': '年假',
    'OTHER': '其他'
  }
  return map[type] || type
}

const goToDetail = (id) => {
  router.push(`/detail/${id}`)
}

const onLoad = async () => {
  try {
    let res
    if (user?.role === 'STUDENT') {
      res = await getMyLeaves()
    } else if (props.status?.includes('APPROVED')) {
      res = await getApproved()
    } else if (props.status?.includes('REJECTED')) {
      res = await getRejected()
    } else {
      res = { success: true, data: [] }
    }
    
    if (res.success) {
      list.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
    finished.value = true
  }
}

onMounted(() => {
  loading.value = true
  onLoad()
})
</script>

<style scoped>
.leave-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.leave-info {
  text-align: right;
}

.leave-info .date {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
