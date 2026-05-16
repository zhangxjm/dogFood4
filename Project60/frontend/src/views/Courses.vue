<template>
  <div class="courses-page">
    <van-nav-bar title="课程管理" fixed placeholder />
    
    <van-tabs v-model:active="activeTab">
      <van-tab title="课程列表" name="courses">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了">
            <van-card
              v-for="course in courses"
              :key="course.id"
              :title="course.name"
              :desc="course.description"
              :price="course.price"
              class="card-item"
            >
              <template #tag>
                <van-tag type="primary">{{ course.total_hours }}课时</van-tag>
              </template>
              <template #footer>
                <van-button size="small" type="danger" plain @click="deleteCourse(course)">
                  删除
                </van-button>
              </template>
            </van-card>
          </van-list>
        </van-pull-refresh>
      </van-tab>
      
      <van-tab title="班级列表" name="classes">
        <van-pull-refresh v-model="classRefreshing" @refresh="onClassRefresh">
          <van-list v-model:loading="classLoading" :finished="classFinished" finished-text="没有更多了">
            <van-cell-group v-for="cls in classes" :key="cls.id" class="card-item">
              <van-cell :title="cls.name">
                <template #label>
                <div style="font-size: 13px; color: #666">
                  课程：{{ cls.course_name }}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 4px">
                  老师：{{ cls.teacher_name }} · {{ cls.schedule }}
                </div>
              </template>
              <template #right-icon>
                <van-tag :type="cls.current_students >= cls.max_students ? 'danger' : 'success'">
                  {{ cls.current_students || 0 }}/{{ cls.max_students }}人
                </van-tag>
              </template>
              </van-cell>
            </van-cell-group>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>

    <van-fab
      icon="plus"
      @click="showAdd = true"
      style="right: 16px; bottom: 70px"
    />

    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup-content">
        <h3 class="popup-title">添加{{ activeAdd === 'course' ? '课程' : '班级'}}</h3>
        <van-tabs v-model:active="activeAdd">
          <van-tab title="添加课程" name="course">
            <van-form @submit="onSubmitCourse">
              <van-field
                v-model="courseForm.name"
                label="课程名称"
                placeholder="请输入课程名称"
                :rules="[{ required: true }"
              />
              <van-field
                v-model="courseForm.description"
                label="课程描述"
                placeholder="请输入课程描述"
              />
              <van-field
                v-model="courseForm.total_hours"
                label="总课时"
                type="number"
                placeholder="请输入总课时"
                :rules="[{ required: true }]"
              />
              <van-field
                v-model="courseForm.price"
                label="课程价格"
                type="number"
                placeholder="请输入课程价格"
                :rules="[{ required: true }]"
              />
              <van-field name="teacher" label="授课老师">
                <template #input>
                  <van-picker
                    :columns="teacherColumns"
                    v-model="courseForm.teacher"
                    @confirm="onTeacherConfirm"
                  />
                </template>
              </van-field>
              <div style="margin: 16px">
                <van-button round block type="primary" native-type="submit">
                  提交
                </van-button>
              </div>
            </van-form>
          </van-tab>
          <van-tab title="添加班级" name="class">
            <van-form @submit="onSubmitClass">
              <van-field
                v-model="classForm.name"
                label="班级名称"
                placeholder="请输入班级名称"
                :rules="[{ required: true }]"
              />
              <van-field name="course" label="所属课程">
                <template #input>
                  <van-picker
                    :columns="courseColumns"
                    v-model="classForm.course"
                    @confirm="onCourseConfirm"
                  />
                </template>
              </van-field>
              <van-field name="teacher" label="授课老师">
                <template #input>
                  <van-picker
                    :columns="teacherColumns"
                    v-model="classForm.teacher"
                    @confirm="onClassTeacherConfirm"
                  />
                </template>
              </van-field>
              <van-field
                v-model="classForm.max_students"
                label="最大人数"
                type="number"
                placeholder="请输入最大人数"
                :rules="[{ required: true }]"
              />
              <van-field
                v-model="classForm.schedule"
                label="上课时间"
                placeholder="例如：每周六上午9:00"
                :rules="[{ required: true }]"
              />
              <van-cell title="开课日期" is-link @click="showStartDate = true">
                <template #value>
                  <span class="value">{{ classForm.start_date || '请选择' }}</span>
                </template>
              </van-cell>
              <van-cell title="结课日期" is-link @click="showEndDate = true">
                <template #value>
                  <span class="value">{{ classForm.end_date || '请选择' }}</span>
                </template>
              </van-cell>
              <div style="margin: 16px">
                <van-button round block type="primary" native-type="submit">
                  提交
                </van-button>
              </div>
            </van-form>
          </van-tab>
        </van-tabs>
      </div>
    </van-popup>

    <van-calendar v-model:show="showStartDate" @confirm="onConfirmStartDate" />
    <van-calendar v-model:show="showEndDate" @confirm="onConfirmEndDate" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getCourses, createCourse, deleteCourse, getTeachers, getClasses, createClass } from '../api'

const activeTab = ref('courses')
const activeAdd = ref('course')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const classRefreshing = ref(false)
const classLoading = ref(false)
const classFinished = ref(false)
const showAdd = ref(false)
const showStartDate = ref(false)
const showEndDate = ref(false)

const courses = ref([])
const classes = ref([])
const teachers = ref([])

const courseForm = ref({
  name: '',
  description: '',
  total_hours: '',
  price: '',
  teacher: null
})

const classForm = ref({
  name: '',
  course: null,
  teacher: null,
  max_students: '',
  schedule: '',
  start_date: '',
  end_date: ''
})

const teacherColumns = computed(() => {
  return teachers.value.map(t => ({ text: t.name, value: t.id }))
})

const courseColumns = computed(() => {
  return courses.value.map(c => ({ text: c.name, value: c.id }))
})

const loadCourses = async () => {
  try {
    const res = await getCourses()
    courses.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const loadClasses = async () => {
  try {
    const res = await getClasses()
    classes.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const loadTeachers = async () => {
  try {
    const res = await getTeachers()
    teachers.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const onRefresh = async () => {
  await loadCourses()
  refreshing.value = false
}

const onClassRefresh = async () => {
  await loadClasses()
  classRefreshing.value = false
}

const onTeacherConfirm = ({ selectedOptions }) => {
  courseForm.value.teacher = selectedOptions[0].value
}

const onCourseConfirm = ({ selectedOptions }) => {
  classForm.value.course = selectedOptions[0].value
}

const onClassTeacherConfirm = ({ selectedOptions }) => {
  classForm.value.teacher = selectedOptions[0].value
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const onConfirmStartDate = (value) => {
  classForm.value.start_date = formatDate(value)
  showStartDate.value = false
}

const onConfirmEndDate = (value) => {
  classForm.value.end_date = formatDate(value)
  showEndDate.value = false
}

const onSubmitCourse = async () => {
  try {
    const data = { ...courseForm.value }
    if (data.teacher) {
      data.teacher = data.teacher
    }
    await createCourse(data)
    showToast('添加成功')
    showAdd.value = false
    courseForm.value = { name: '', description: '', total_hours: '', price: '', teacher: null }
    await loadCourses()
  } catch (e) {
    showToast('添加失败')
  }
}

const onSubmitClass = async () => {
  try {
    const data = { ...classForm.value }
    await createClass(data)
    showToast('添加成功')
    showAdd.value = false
    classForm.value = { name: '', course: null, teacher: null, max_students: '', schedule: '', start_date: '', end_date: '' }
    await loadClasses()
  } catch (e) {
    showToast('添加失败')
  }
}

const deleteCourse = async (course) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除课程"${course.name}"吗？`
    })
    await deleteCourse(course.id)
    showToast('删除成功')
    await loadCourses()
  } catch (e) {
    if (e !== 'cancel') {
      showToast('删除失败')
    }
  }
}

onMounted(() => {
  loadCourses()
  loadClasses()
  loadTeachers()
})
</script>

<style scoped>
.popup-content {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.popup-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.value {
  color: #969799;
}
</style>
