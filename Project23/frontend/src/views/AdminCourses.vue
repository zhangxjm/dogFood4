<template>
  <div class="admin-page">
    <van-nav-bar
      title="课程管理"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <van-icon name="plus" @click="showAddForm = true" />
      </template>
    </van-nav-bar>
    
    <div class="content">
      <van-empty v-if="courses.length === 0 && !loading" description="暂无课程" />
      
      <van-loading v-if="loading" class="loading" type="spinner" />
      
      <van-list
        v-else
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadCourses"
      >
        <van-cell-group v-if="courses.length > 0">
          <van-cell
            v-for="course in courses"
            :key="course.id"
            :title="course.name"
            :label="`${course.courseDate} ${course.startTime}-${course.endTime} | 教练：${course.instructor}`"
            is-link
            @click="showCourseEdit(course)"
          >
            <template #value>
              <div class="course-capacity">
                <span :class="{ full: course.reservedCount >= course.maxCapacity }">
                  {{ course.reservedCount }}/{{ course.maxCapacity }}
                </span>
                <van-tag :type="course.status === 'AVAILABLE' ? 'primary' : 'default'" size="small">
                  {{ course.status === 'AVAILABLE' ? '可预约' : '已结束' }}
                </van-tag>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </div>
    
    <van-popup
      v-model:show="showAddForm"
      position="bottom"
      :style="{ height: '90%' }"
    >
      <div class="course-form">
        <van-nav-bar
          :title="isEditing ? '编辑课程' : '发布课程'"
          left-arrow
          @click-left="closeForm"
        />
        
        <div class="form-content">
          <van-form @submit="submitCourse">
            <van-cell-group inset>
              <van-field
                v-model="formData.name"
                name="name"
                label="课程名称"
                placeholder="请输入课程名称"
                :rules="[{ required: true, message: '请输入课程名称' }]"
              />
              <van-field
                v-model="formData.instructor"
                name="instructor"
                label="教练"
                placeholder="请输入教练姓名"
                :rules="[{ required: true, message: '请输入教练姓名' }]"
              />
              <van-field
                v-model="formData.courseDate"
                name="courseDate"
                label="上课日期"
                placeholder="请选择日期"
                readonly
                is-link
                @click="showDatePicker = true"
                :rules="[{ required: true, message: '请选择上课日期' }]"
              />
              <van-field
                v-model="formData.startTime"
                name="startTime"
                label="开始时间"
                placeholder="请选择开始时间"
                readonly
                is-link
                @click="showStartTimePicker = true"
                :rules="[{ required: true, message: '请选择开始时间' }]"
              />
              <van-field
                v-model="formData.endTime"
                name="endTime"
                label="结束时间"
                placeholder="请选择结束时间"
                readonly
                is-link
                @click="showEndTimePicker = true"
                :rules="[{ required: true, message: '请选择结束时间' }]"
              />
              <van-field
                v-model.number="formData.maxCapacity"
                name="maxCapacity"
                label="最大容量"
                type="number"
                placeholder="请输入最大人数"
                :rules="[{ required: true, message: '请输入最大人数' }]"
              />
              <van-field
                v-model="formData.description"
                name="description"
                label="课程描述"
                type="textarea"
                placeholder="请输入课程描述（可选）"
                rows="3"
                autosize
              />
            </van-cell-group>
            
            <div class="form-actions">
              <van-button
                v-if="isEditing"
                type="danger"
                plain
                block
                @click="deleteCourse"
                style="margin-bottom: 12px"
              >
                删除课程
              </van-button>
              <van-button type="primary" round block native-type="submit" :loading="submitting">
                {{ isEditing ? '保存修改' : '发布课程' }}
              </van-button>
            </div>
          </van-form>
        </div>
        
        <van-popup
          v-model:show="showDatePicker"
          position="bottom"
          round
        >
          <van-datetime-picker
            v-model="currentDate"
            type="date"
            title="选择日期"
            @confirm="confirmDate"
            @cancel="showDatePicker = false"
          />
        </van-popup>
        
        <van-popup
          v-model:show="showStartTimePicker"
          position="bottom"
          round
        >
          <van-datetime-picker
            v-model="currentStartTime"
            type="time"
            title="选择开始时间"
            @confirm="confirmStartTime"
            @cancel="showStartTimePicker = false"
          />
        </van-popup>
        
        <van-popup
          v-model:show="showEndTimePicker"
          position="bottom"
          round
        >
          <van-datetime-picker
            v-model="currentEndTime"
            type="time"
            title="选择结束时间"
            @confirm="confirmEndTime"
            @cancel="showEndTimePicker = false"
          />
        </van-popup>
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
import { ref, reactive, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { courseApi } from '../api'
import dayjs from 'dayjs'

const activeTab = ref(2)
const courses = ref([])
const loading = ref(false)
const finished = ref(false)

const showAddForm = ref(false)
const showDatePicker = ref(false)
const showStartTimePicker = ref(false)
const showEndTimePicker = ref(false)

const isEditing = ref(false)
const submitting = ref(false)
const currentDate = ref(new Date())
const currentStartTime = ref(new Date())
const currentEndTime = ref(new Date())

const formData = reactive({
  name: '',
  instructor: '',
  courseDate: '',
  startTime: '',
  endTime: '',
  maxCapacity: 10,
  description: '',
  status: 'AVAILABLE'
})

const loadCourses = async () => {
  try {
    const data = await courseApi.getAllCourses()
    courses.value = data
    finished.value = true
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.name = ''
  formData.instructor = ''
  formData.courseDate = ''
  formData.startTime = ''
  formData.endTime = ''
  formData.maxCapacity = 10
  formData.description = ''
  formData.status = 'AVAILABLE'
  isEditing.value = false
}

const showCourseEdit = (course) => {
  isEditing.value = true
  formData.name = course.name
  formData.instructor = course.instructor
  formData.courseDate = course.courseDate
  formData.startTime = course.startTime
  formData.endTime = course.endTime
  formData.maxCapacity = course.maxCapacity
  formData.description = course.description || ''
  formData.status = course.status
  showAddForm.value = true
}

const closeForm = () => {
  showAddForm.value = false
  resetForm()
}

const confirmDate = (value) => {
  formData.courseDate = dayjs(value).format('YYYY-MM-DD')
  showDatePicker.value = false
}

const confirmStartTime = (value) => {
  formData.startTime = dayjs(value).format('HH:mm:ss')
  showStartTimePicker.value = false
}

const confirmEndTime = (value) => {
  formData.endTime = dayjs(value).format('HH:mm:ss')
  showEndTimePicker.value = false
}

const submitCourse = async () => {
  try {
    submitting.value = true
    
    if (isEditing.value) {
      await courseApi.updateCourse(courses.value.find(c => c.id === formData.id)?.id || courses.value.find(c => c.name === formData.name && c.courseDate === formData.courseDate)?.id, formData)
      showToast('修改成功')
    } else {
      await courseApi.createCourse(formData)
      showToast('发布成功')
    }
    
    closeForm()
    courses.value = []
    finished.value = false
    loading.value = false
    loadCourses()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const deleteCourse = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个课程吗？'
    })
  } catch {
    return
  }
  
  try {
    const courseId = courses.value.find(c => 
      c.name === formData.name && c.courseDate === formData.courseDate
    )?.id
    
    if (courseId) {
      await courseApi.deleteCourse(courseId)
      showToast('删除成功')
      closeForm()
      courses.value = []
      finished.value = false
      loading.value = false
      loadCourses()
    }
  } catch (e) {
    console.error(e)
  }
}

const onClickLeft = () => {
  showToast('返回')
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.admin-page {
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

.course-capacity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.course-capacity span {
  font-size: 12px;
  color: #07c160;
}

.course-capacity span.full {
  color: #ee0a24;
}

.course-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-actions {
  margin-top: 20px;
  padding: 0 16px;
}
</style>
