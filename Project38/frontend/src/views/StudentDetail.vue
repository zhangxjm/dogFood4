<template>
  <div class="student-detail">
    <van-nav-bar
      title="学员详情"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    >
      <template #right>
        <van-icon name="edit" size="22" @click="goToEdit" />
      </template>
    </van-nav-bar>
    
    <van-loading v-if="loading" style="text-align: center; margin-top: 50px;" />
    
    <div v-else>
      <van-cell-group inset>
        <van-cell title="姓名" :value="student.name" />
        <van-cell title="性别" :value="student.gender" />
        <van-cell title="出生日期" :value="student.birthDate" />
        <van-cell title="学员电话" :value="student.phone" />
        <van-cell title="家长姓名" :value="student.parentName" />
        <van-cell title="家长电话" :value="student.parentPhone" />
        <van-cell title="家庭地址" :value="student.address" />
        <van-cell title="备注" :value="student.notes" />
      </van-cell-group>
      
      <div class="section-title">
        <van-divider>已报课程</van-divider>
      </div>
      
      <van-cell-group inset>
        <van-cell
          v-for="course in studentCourses"
          :key="course.id"
          :title="getCourseName(course.course?.id)"
          :label="course.enrollDate"
        >
          <template #right-icon>
            <span style="color: #07c160;">{{ course.status }}</span>
          </template>
        </van-cell>
        <van-empty v-if="studentCourses.length === 0" description="暂无课程" :image-size="60" />
      </van-cell-group>
      
      <div class="section-title">
        <van-divider>缴费记录</van-divider>
      </div>
      
      <van-cell-group inset>
        <van-cell
          v-for="payment in paymentRecords"
          :key="payment.id"
          :title="`¥${payment.amount}`"
          :label="`${payment.paymentDate} - ${payment.paymentMethod}`"
        />
        <van-empty v-if="paymentRecords.length === 0" description="暂无缴费记录" :image-size="60" />
      </van-cell-group>
      
      <div class="action-buttons">
        <van-button type="primary" size="large" block @click="goToAddCourse">
          绑定课程
        </van-button>
        <van-button type="success" size="large" block style="margin-top: 10px;" @click="goToAddPayment">
          登记缴费
        </van-button>
        <van-button type="danger" size="large" block style="margin-top: 10px;" @click="deleteStudent">
          删除学员
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { studentApi, courseApi, studentCourseApi, paymentApi } from '../api'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()

const studentId = route.params.id
const student = ref({})
const studentCourses = ref([])
const paymentRecords = ref([])
const courses = ref([])
const loading = ref(true)

const getCourseName = (courseId) => {
  const course = courses.value.find(c => c.id === courseId)
  return course ? course.name : '未知课程'
}

const fetchStudent = async () => {
  try {
    loading.value = true
    const [studentRes, coursesRes] = await Promise.all([
      studentApi.getById(studentId),
      courseApi.getAll()
    ])
    student.value = studentRes.data
    courses.value = coursesRes.data
    
    const [studentCoursesRes, paymentRes] = await Promise.all([
      studentCourseApi.getByStudentId(studentId),
      paymentApi.getByStudentId(studentId)
    ])
    studentCourses.value = studentCoursesRes.data
    paymentRecords.value = paymentRes.data
  } catch (error) {
    showToast('获取详情失败')
  } finally {
    loading.value = false
  }
}

const deleteStudent = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要删除该学员吗？'
    })
    await studentApi.delete(studentId)
    showToast('删除成功')
    setTimeout(() => {
      router.back()
    }, 1000)
  } catch (error) {
    if (error !== 'cancel') {
      showToast('删除失败')
    }
  }
}

const goBack = () => {
  router.back()
}

const goToEdit = () => {
  router.push(`/students/edit/${studentId}`)
}

const goToAddCourse = () => {
  router.push(`/student-courses/add/${studentId}`)
}

const goToAddPayment = () => {
  router.push(`/payments/add/${studentId}`)
}

onMounted(() => {
  fetchStudent()
})
</script>

<style scoped>
.student-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.section-title {
  margin-top: 16px;
}

.action-buttons {
  padding: 16px;
}
</style>
