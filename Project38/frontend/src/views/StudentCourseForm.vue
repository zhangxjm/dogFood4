<template>
  <div class="student-course-form">
    <van-nav-bar
      title="绑定课程"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.course"
          name="course"
          label="选择课程"
          placeholder="请选择课程"
          readonly
          is-link
          :rules="[{ required: true, message: '请选择课程' }]"
          @click="showCoursePicker = true"
        />
        
        <van-field
          v-model="form.enrollDate"
          name="enrollDate"
          label="报名日期"
          placeholder="请选择报名日期"
          readonly
          is-link
          :rules="[{ required: true, message: '请选择报名日期' }]"
          @click="showDatePicker = true"
        />
        
        <van-field
          v-model="form.status"
          name="status"
          label="课程状态"
          placeholder="请选择状态"
          readonly
          is-link
          @click="showStatusPicker = true"
        />
        
        <van-field
          v-model="form.notes"
          name="notes"
          label="备注"
          placeholder="请输入备注"
          type="textarea"
        />
      </van-cell-group>
      
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
    
    <van-popup v-model:show="showCoursePicker" position="bottom">
      <van-picker
        :columns="courseColumns"
        @confirm="onCourseConfirm"
        @cancel="showCoursePicker = false"
      />
    </van-popup>
    
    <van-calendar
      v-model:show="showDatePicker"
      type="single"
      @confirm="onDateConfirm"
      color="#1989fa"
    />
    
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { courseApi, studentCourseApi } from '../api'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

const studentId = route.params.studentId

const form = ref({
  course: '',
  courseId: null,
  enrollDate: '',
  status: '进行中',
  notes: ''
})

const courses = ref([])
const currentDate = ref(new Date())

const showCoursePicker = ref(false)
const showDatePicker = ref(false)
const showStatusPicker = ref(false)

const courseColumns = computed(() => {
  return courses.value.map(course => ({
    text: course.name,
    value: course.id
  }))
})

const statusColumns = [
  { text: '进行中', value: '进行中' },
  { text: '已完成', value: '已完成' },
  { text: '已暂停', value: '已暂停' }
]

const fetchCourses = async () => {
  try {
    const response = await courseApi.getAll()
    courses.value = response.data
  } catch (error) {
    showToast('获取课程列表失败')
  }
}

const onCourseConfirm = ({ selectedOptions }) => {
  form.value.course = selectedOptions[0].text
  form.value.courseId = selectedOptions[0].value
  showCoursePicker.value = false
}

const onDateConfirm = (value) => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  form.value.enrollDate = `${year}-${month}-${day}`
  showDatePicker.value = false
}

const onStatusConfirm = ({ selectedOptions }) => {
  form.value.status = selectedOptions[0].text
  showStatusPicker.value = false
}

const onSubmit = async () => {
  try {
    const submitData = {
      student: { id: parseInt(studentId) },
      course: { id: form.value.courseId },
      enrollDate: form.value.enrollDate,
      status: form.value.status,
      notes: form.value.notes
    }
    
    await studentCourseApi.create(submitData)
    showToast('绑定成功')
    setTimeout(() => {
      router.back()
    }, 1000)
  } catch (error) {
    showToast('操作失败')
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.student-course-form {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}
</style>
