<template>
  <div class="approve-list">
    <van-loading v-if="loading" style="margin-top: 50px;" />
    
    <van-empty v-if="!loading && list.length === 0" description="暂无待审批" />
    
    <van-list
      v-else
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell-group inset style="margin-bottom: 10px;" v-for="item in list" :key="item.id">
        <van-cell is-link @click="goToDetail(item.id)">
          <template #title>
            <div class="leave-title">
              <span>{{ item.student?.name || '未知' }}</span>
              <van-tag type="warning" size="small">
                {{ type === 'first' ? '待一级审批' : '待二级审批' }}
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
        
        <van-cell>
          <template #default>
            <div class="reason">请假原因: {{ item.reason }}</div>
          </template>
        </van-cell>
        
        <van-cell>
          <template #default>
            <div class="action-buttons">
              <van-button type="danger" size="small" @click="handleReject(item)">驳回</van-button>
              <van-button type="primary" size="small" @click="handleApprove(item)">通过</van-button>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </van-list>
    
    <van-popup v-model:show="showComment" position="bottom" round>
      <div class="comment-popup">
        <h3>{{ currentAction === 'approve' ? '审批通过' : '审批驳回' }}</h3>
        <van-field
          v-model="comment"
          type="textarea"
          placeholder="请输入审批意见（可选）"
          rows="3"
        />
        <div class="popup-actions">
          <van-button block type="primary" @click="submitApprove">确认提交</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getPendingFirst, getPendingSecond, approveFirst, approveSecond } from '../api'

const props = defineProps({
  type: {
    type: String,
    required: true
  }
})

const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const list = ref([])
const showComment = ref(false)
const comment = ref('')
const currentItem = ref(null)
const currentAction = ref('')

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

const handleApprove = (item) => {
  currentItem.value = item
  currentAction.value = 'approve'
  comment.value = ''
  showComment.value = true
}

const handleReject = (item) => {
  currentItem.value = item
  currentAction.value = 'reject'
  comment.value = ''
  showComment.value = true
}

const submitApprove = async () => {
  if (!currentItem.value) return
  
  try {
    let res
    const data = {
      approved: currentAction.value === 'approve',
      comment: comment.value
    }
    
    if (props.type === 'first') {
      res = await approveFirst(currentItem.value.id, data)
    } else {
      res = await approveSecond(currentItem.value.id, data)
    }
    
    if (res.success) {
      showToast('审批成功')
      showComment.value = false
      list.value = list.value.filter(item => item.id !== currentItem.value.id)
    } else {
      showToast(res.message || '审批失败')
    }
  } catch (error) {
    showToast('审批失败')
  }
}

const onLoad = async () => {
  try {
    let res
    if (props.type === 'first') {
      res = await getPendingFirst()
    } else {
      res = await getPendingSecond()
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

.reason {
  font-size: 14px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.comment-popup {
  padding: 20px;
}

.comment-popup h3 {
  margin: 0 0 15px 0;
  text-align: center;
}

.popup-actions {
  margin-top: 15px;
}
</style>
