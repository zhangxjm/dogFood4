<template>
  <div class="reservations-page">
    <van-nav-bar
      title="我的预约"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <van-icon name="user-o" @click="showMemberSelector = true" />
      </template>
    </van-nav-bar>
    
    <div class="content">
      <van-empty v-if="!currentMember" description="请先选择会员" />
      
      <template v-else>
        <div class="member-info">
          <van-tag type="primary" size="large">
            {{ currentMember.name }} - {{ currentMember.phone }}
          </van-tag>
        </div>
        
        <van-empty v-if="reservations.length === 0 && !loading" description="暂无预约记录" />
        
        <van-loading v-if="loading" class="loading" type="spinner" />
        
        <van-list
          v-else
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadReservations"
        >
          <van-cell-group v-if="reservations.length > 0">
            <van-cell
              v-for="reservation in reservations"
              :key="reservation.id"
              :title="reservation.course ? reservation.course.name : '未知课程'"
              :label="getReservationLabel(reservation)"
            >
              <template #value>
                <div class="reservation-status">
                  <van-tag
                    :type="reservation.status === 'ACTIVE' ? 'primary' : 'default'"
                  >
                    {{ getStatusText(reservation.status) }}
                  </van-tag>
                  <van-button
                    v-if="reservation.status === 'ACTIVE'"
                    type="danger"
                    size="small"
                    :loading="cancellingId === reservation.id"
                    @click.stop="cancelReservation(reservation)"
                    style="margin-top: 8px"
                  >
                    取消预约
                  </van-button>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </van-list>
      </template>
    </div>
    
    <van-popup
      v-model:show="showMemberSelector"
      position="bottom"
      :style="{ height: '60%' }"
    >
      <div class="member-selector">
        <van-nav-bar title="选择会员" left-arrow @click-left="showMemberSelector = false" />
        <van-list v-model:loading="memberLoading" :finished="memberFinished" @load="loadMembers">
          <van-cell
            v-for="member in members"
            :key="member.id"
            :title="member.name"
            :label="member.phone"
            clickable
            @click="selectMember(member)"
          >
            <template #value>
              <van-tag v-if="currentMember && currentMember.id === member.id" type="primary">当前</van-tag>
            </template>
          </van-cell>
        </van-list>
      </div>
    </van-popup>
    
    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item to="/courses" icon="friends-o">预约课程</van-tabbar-item>
      <van-tabbar-item to="/reservations" icon="records">我的预约</van-tabbar-item>
      <van-tabbar-item to="/admin/courses" icon="setting-o">课程管理</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { reservationApi } from '../api'
import dayjs from 'dayjs'

const activeTab = ref(1)
const reservations = ref([])
const loading = ref(false)
const finished = ref(false)
const cancellingId = ref(null)

const showMemberSelector = ref(false)
const members = ref([])
const memberLoading = ref(false)
const memberFinished = ref(false)
const currentMember = ref(null)

const getStatusText = (status) => {
  const map = {
    'ACTIVE': '已预约',
    'CANCELLED': '已取消',
    'COMPLETED': '已完成'
  }
  return map[status] || status
}

const getReservationLabel = (reservation) => {
  const course = reservation.course
  if (!course) return `预约时间：${dayjs(reservation.reservationTime).format('YYYY-MM-DD HH:mm')}`
  
  return `${course.courseDate} ${course.startTime}-${course.endTime} | 教练：${course.instructor}`
}

const loadReservations = async () => {
  if (!currentMember.value) {
    loading.value = false
    finished.value = true
    return
  }
  
  try {
    const data = await reservationApi.getReservationsByMember(currentMember.value.id)
    reservations.value = data
    finished.value = true
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadMembers = async () => {
  try {
    memberLoading.value = true
    if (members.value.length === 0) {
      members.value = [
        { id: 1, name: '张三', phone: '13800138001' },
        { id: 2, name: '李四', phone: '13800138002' },
        { id: 3, name: '王五', phone: '13800138003' }
      ]
    }
    memberFinished.value = true
  } catch (e) {
    console.error(e)
  } finally {
    memberLoading.value = false
  }
}

const selectMember = (member) => {
  currentMember.value = member
  showMemberSelector.value = false
  showToast(`已选择：${member.name}`)
  reservations.value = []
  loading.value = false
  finished.value = false
  loadReservations()
}

const cancelReservation = async (reservation) => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消这个预约吗？'
    })
  } catch {
    return
  }
  
  try {
    cancellingId.value = reservation.id
    await reservationApi.cancelReservation(reservation.id)
    showToast('取消成功')
    loadReservations()
  } catch (e) {
    console.error(e)
  } finally {
    cancellingId.value = null
  }
}

const onClickLeft = () => {
  showToast('返回')
}

onMounted(() => {
  loadMembers()
})
</script>

<style scoped>
.reservations-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding-bottom: 50px;
}

.loading {
  text-align: center;
  padding: 20px;
}

.member-info {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #ebedf0;
}

.reservation-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.member-selector {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
