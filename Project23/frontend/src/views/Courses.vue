<template>
  <div class="courses-page">
    <van-nav-bar
      title="课程预约"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <van-icon name="user-o" @click="showMemberSelector = true" />
      </template>
    </van-nav-bar>
    
    <div class="content">
      <van-empty v-if="courses.length === 0 && !loading" description="暂无可用课程" />
      
      <van-loading v-if="loading" class="loading" type="spinner" />
      
      <van-list
        v-else
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadCourses"
      >
        <van-cell-group v-if="groupedCourses.length > 0">
          <template v-for="(group, index) in groupedCourses" :key="index">
            <div class="date-header">{{ group.dateStr }}</div>
            <van-cell
              v-for="course in group.courses"
              :key="course.id"
              :title="course.name"
              :value="`${course.instructor}`"
              :label="`${course.startTime} - ${course.endTime}`"
              is-link
              @click="showCourseDetail(course)"
            >
              <template #value>
                <div class="course-info">
                  <div>{{ course.instructor }}</div>
                  <div class="capacity" :class="{ full: course.reservedCount >= course.maxCapacity }">
                    {{ course.reservedCount }}/{{ course.maxCapacity }}
                  </div>
                </div>
              </template>
            </van-cell>
          </template>
        </van-cell-group>
      </van-list>
    </div>
    
    <van-popup
      v-model:show="showMemberSelector"
      position="bottom"
      :style="{ height: '60%' }"
    >
      <div class="member-selector">
        <van-nav-bar title="选择会员" left-arrow @click-left="showMemberSelector = false" />
        <van-search
          v-model="memberSearch"
          placeholder="搜索手机号"
          show-action
          @search="searchMember"
        >
          <template #action>
            <div @click="addNewMember">新增</div>
          </template>
        </van-search>
        
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
    
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      :style="{ height: '70%' }"
    >
      <div class="course-detail" v-if="selectedCourse">
        <van-nav-bar title="课程详情" left-arrow @click-left="showDetail = false" />
        <div class="detail-content">
          <div class="detail-header">
            <h2>{{ selectedCourse.name }}</h2>
            <div class="instructor">{{ selectedCourse.instructor }}</div>
          </div>
          
          <van-cell-group inset>
            <van-cell title="日期" :value="selectedCourse.courseDate" />
            <van-cell title="时间" :value="`${selectedCourse.startTime} - ${selectedCourse.endTime}`" />
            <van-cell title="容量">
              <template #value>
                <span :class="{ full: selectedCourse.reservedCount >= selectedCourse.maxCapacity }">
                  {{ selectedCourse.reservedCount }}/{{ selectedCourse.maxCapacity }}
                </span>
              </template>
            </van-cell>
            <van-cell v-if="selectedCourse.description" title="描述" :value="selectedCourse.description" />
          </van-cell-group>
          
          <div class="action-bar">
            <van-button
              v-if="!isMemberSelected"
              type="primary"
              block
              size="large"
              @click="showMemberSelector = true; showDetail = false"
            >
              先选择会员
            </van-button>
            <van-button
              v-else-if="selectedCourse.reservedCount >= selectedCourse.maxCapacity"
              type="danger"
              block
              size="large"
              disabled
            >
              已约满
            </van-button>
            <van-button
              v-else
              type="primary"
              block
              size="large"
              :loading="reserving"
              @click="reserveCourse"
            >
              立即预约
            </van-button>
          </div>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { courseApi, memberApi, reservationApi } from '../api'
import dayjs from 'dayjs'

const activeTab = ref(0)
const courses = ref([])
const loading = ref(false)
const finished = ref(false)

const showMemberSelector = ref(false)
const showDetail = ref(false)
const selectedCourse = ref(null)
const memberSearch = ref('')
const members = ref([])
const memberLoading = ref(false)
const memberFinished = ref(false)
const currentMember = ref(null)
const reserving = ref(false)

const isMemberSelected = computed(() => !!currentMember.value)

const groupedCourses = computed(() => {
  const groups = {}
  courses.value.forEach(course => {
    const dateStr = dayjs(course.courseDate).format('YYYY-MM-DD dddd')
    if (!groups[dateStr]) {
      groups[dateStr] = { dateStr, courses: [] }
    }
    groups[dateStr].courses.push(course)
  })
  return Object.values(groups)
})

const loadCourses = async () => {
  try {
    const data = await courseApi.getAvailableCourses()
    courses.value = data
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
    const data = await memberApi.getMemberById ? [] : []
    const allMembers = await memberApi.getMemberById ? [] : []
    
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

const searchMember = async () => {
  if (!memberSearch.value) {
    showToast('请输入手机号')
    return
  }
  try {
    const member = await memberApi.getMemberByPhone(memberSearch.value)
    if (member) {
      selectMember(member)
    }
  } catch (e) {
    showToast('未找到该会员')
  }
}

const addNewMember = async () => {
  if (!memberSearch.value) {
    showToast('请输入手机号')
    return
  }
  
  try {
    const newMember = await memberApi.createMember({
      name: '新会员',
      phone: memberSearch.value
    })
    selectMember(newMember)
    showToast('会员创建成功')
  } catch (e) {
    showToast(e.message || '创建失败')
  }
}

const selectMember = (member) => {
  currentMember.value = member
  showMemberSelector.value = false
  showToast(`已选择：${member.name}`)
}

const showCourseDetail = (course) => {
  selectedCourse.value = course
  showDetail.value = true
}

const reserveCourse = async () => {
  if (!currentMember.value) {
    showToast('请先选择会员')
    return
  }
  
  try {
    await showConfirmDialog({
      title: '确认预约',
      message: `确认预约 ${selectedCourse.value.name} 课程吗？`
    })
  } catch {
    return
  }
  
  try {
    reserving.value = true
    await reservationApi.createReservation({
      memberId: currentMember.value.id,
      courseId: selectedCourse.value.id
    })
    showToast('预约成功')
    showDetail.value = false
    loadCourses()
  } catch (e) {
    console.error(e)
  } finally {
    reserving.value = false
  }
}

const onClickLeft = () => {
  showToast('返回')
}

onMounted(() => {
  loadCourses()
  loadMembers()
})
</script>

<style scoped>
.courses-page {
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

.date-header {
  padding: 12px 16px;
  background-color: #f5f5f5;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.course-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.capacity {
  font-size: 12px;
  color: #07c160;
}

.capacity.full {
  color: #ee0a24;
}

.member-selector {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.course-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 80px;
  overflow-y: auto;
}

.detail-header {
  text-align: center;
  padding: 20px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  color: white;
}

.detail-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.instructor {
  opacity: 0.9;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}
</style>
