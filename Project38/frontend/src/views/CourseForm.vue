<template>
  <div class="course-form">
    <van-nav-bar
      :title="isEdit ? '编辑课程' : '新增课程'"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          name="name"
          label="课程名称"
          placeholder="请输入课程名称"
          :rules="[{ required: true, message: '请输入课程名称' }]"
        />
        
        <van-field
          v-model="form.category"
          name="category"
          label="课程分类"
          placeholder="请输入课程分类"
        />
        
        <van-field
          v-model="form.description"
          name="description"
          label="课程描述"
          placeholder="请输入课程描述"
          type="textarea"
        />
        
        <van-field
          v-model="form.price"
          name="price"
          label="课程价格"
          placeholder="请输入课程价格"
          type="number"
          :rules="[{ required: true, message: '请输入课程价格' }]"
        />
        
        <van-field
          v-model="form.duration"
          name="duration"
          label="课程时长"
          placeholder="请输入课程时长"
        />
        
        <van-field
          v-model="form.teacher"
          name="teacher"
          label="授课老师"
          placeholder="请输入授课老师"
        />
      </van-cell-group>
      
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          {{ isEdit ? '保存修改' : '提交' }}
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { courseApi } from '../api'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const courseId = computed(() => route.params.id)

const form = ref({
  name: '',
  category: '',
  description: '',
  price: '',
  duration: '',
  teacher: ''
})

const fetchCourse = async () => {
  try {
    const response = await courseApi.getById(courseId.value)
    const course = response.data
    form.value = {
      name: course.name || '',
      category: course.category || '',
      description: course.description || '',
      price: course.price || '',
      duration: course.duration || '',
      teacher: course.teacher || ''
    }
  } catch (error) {
    showToast('获取课程信息失败')
  }
}

const onSubmit = async () => {
  try {
    const submitData = {
      ...form.value,
      price: form.value.price ? parseFloat(form.value.price) : 0
    }
    
    if (isEdit.value) {
      await courseApi.update(courseId.value, submitData)
      showToast('修改成功')
    } else {
      await courseApi.create(submitData)
      showToast('添加成功')
    }
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
  if (isEdit.value) {
    fetchCourse()
  }
})
</script>

<style scoped>
.course-form {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}
</style>
