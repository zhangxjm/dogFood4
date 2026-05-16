<template>
  <div class="enroll-page">
    <van-nav-bar title="报名缴费" fixed placeholder />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field name="student" label="选择学员">
          <template #input>
            <van-picker
              :columns="studentColumns"
              v-model="form.student"
              @confirm="onStudentConfirm"
            />
          </template>
        </van-field>
        <van-field name="course" label="选择课程">
          <template #input>
            <van-picker
              :columns="courseColumns"
              v-model="form.course"
              @confirm="onCourseConfirm"
            />
          </template>
        </van-field>
        <van-field name="class_info" label="选择班级">
          <template #input>
            <van-picker
              :columns="classColumns"
              v-model="form.class_info"
              @confirm="onClassConfirm"
            />
          </template>
        </van-field>
        <van-field
          v-model="form.amount"
          name="amount"
          label="缴费金额"
          type="number"
          placeholder="请输入缴费金额"
          :rules="[{ required: true }]"
        />
        <van-field name="payment_method" label="支付方式">
          <template #input>
            <van-radio-group v-model="form.payment_method" direction="horizontal">
              <van-radio name="微信">微信</van-radio>
              <van-radio name="支付宝">支付宝</van-radio>
              <van-radio name="现金">现金</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          确认报名并缴费
        </van-button>
      </div>
    </van-form>

    <div class="section">
      <h3 class="section-title">📋 报名记录</h3>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了">
          <van-cell-group v-for="enrollment in enrollments" :key="enrollment.id" class="card-item">
            <van-cell :title="enrollment.student_name">
              <template #label>
                <div style="font-size: 13px; color: #666">
                  课程：{{ enrollment.course_name }}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 4px">
                  剩余课时：{{ enrollment.remaining_hours }}/{{ enrollment.total_hours }}
                </div>
              </template>
              <template #right-icon>
                <van-tag :type="enrollment.status === 'active' ? 'success' : 'default'">
                  {{ enrollment.status === 'active' ? '在读' : '已结束' }}
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast } from 'vant'
import { getStudents, getCourses, getClasses, getEnrollments, enrollAndPay } from '../api'

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const submitting = ref(false)

const students = ref([])
const courses = ref([])
const classes = ref([])
const enrollments = ref([])

const form = ref({
  student: null,
  course: null,
  class_info: null,
  amount: '',
  payment_method: '微信'
})

const studentColumns = computed(() => {
  return students.value.map(s => ({ text: s.name, value: s.id }))
})

const courseColumns = computed(() => {
  return courses.value.map(c => ({ text: c.name, value: c.id }))
})

const classColumns = computed(() => {
  return classes.value.map(cls => ({ text: cls.name, value: cls.id }))
})

const loadStudents = async () => {
  try {
    const res = await getStudents()
    students.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

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

const loadEnrollments = async () => {
  try {
    const res = await getEnrollments()
    enrollments.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const onStudentConfirm = ({ selectedOptions }) => {
  form.value.student = selectedOptions[0].value
}

const onCourseConfirm = ({ selectedOptions }) => {
  form.value.course = selectedOptions[0].value
  const course = courses.value.find(c => c.id === form.value.course)
  if (course) {
    form.value.amount = course.price
  }
}

const onClassConfirm = ({ selectedOptions }) => {
  form.value.class_info = selectedOptions[0].value
}

const onRefresh = async () => {
  await loadEnrollments()
  refreshing.value = false
}

const onSubmit = async () => {
  if (!form.value.student || !form.value.course) {
    showToast('请选择学员和课程')
    return
  }

  submitting.value = true
  try {
    await enrollAndPay({
      student_id: form.value.student,
      course_id: form.value.course,
      class_info_id: form.value.class_info,
      payment_method: form.value.payment_method,
      amount: form.value.amount
    })
    showToast('报名成功')
    form.value = { student: null, course: null, class_info: null, amount: '', payment_method: '微信' }
    await loadEnrollments()
  } catch (e) {
    showToast(e.response?.data?.error || '报名失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadStudents()
  loadCourses()
  loadClasses()
  loadEnrollments()
})
</script>

<style scoped>
.section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  padding: 0 16px;
  margin-bottom: 12px;
  color: #333;
}
</style>
