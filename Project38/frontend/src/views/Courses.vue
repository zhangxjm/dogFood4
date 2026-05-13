<template>
  <div class="courses">
    <van-nav-bar
      title="课程列表"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    >
      <template #right>
        <van-icon name="plus" size="22" @click="goToAddCourse" />
      </template>
    </van-nav-bar>
    
    <van-search
      v-model="searchValue"
      placeholder="请输入课程名称"
      @search="onSearch"
      @clear="fetchCourses"
    />
    
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell-group inset>
        <van-cell
          v-for="course in courses"
          :key="course.id"
          :title="course.name"
          :label="`${course.teacher} - ¥${course.price}`"
        >
          <template #icon>
            <van-icon name="orders-o" size="24" />
          </template>
        </van-cell>
      </van-cell-group>
    </van-list>
    
    <van-empty v-if="!loading && courses.length === 0" description="暂无课程数据" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { courseApi } from '../api'
import { showToast } from 'vant'

const router = useRouter()
const courses = ref([])
const loading = ref(false)
const finished = ref(false)
const searchValue = ref('')

const fetchCourses = async () => {
  try {
    loading.value = true
    let response
    if (searchValue.value.trim()) {
      response = await courseApi.search({ name: searchValue.value })
    } else {
      response = await courseApi.getAll()
    }
    courses.value = response.data
    finished.value = true
  } catch (error) {
    showToast('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

const onLoad = () => {
  fetchCourses()
}

const onSearch = () => {
  courses.value = []
  finished.value = false
  fetchCourses()
}

const goBack = () => {
  router.push('/')
}

const goToAddCourse = () => {
  router.push('/courses/add')
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.courses {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}
</style>
