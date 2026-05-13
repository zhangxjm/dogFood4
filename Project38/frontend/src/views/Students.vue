<template>
  <div class="students">
    <van-nav-bar
      title="学员列表"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    >
      <template #right>
        <van-icon name="plus" size="22" @click="goToAddStudent" />
      </template>
    </van-nav-bar>
    
    <van-search
      v-model="searchValue"
      placeholder="请输入学员姓名或家长电话"
      @search="onSearch"
      @clear="fetchStudents"
    />
    
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell-group inset>
        <van-cell
          v-for="student in students"
          :key="student.id"
          :title="student.name"
          :label="student.parentPhone"
          is-link
          @click="goToDetail(student.id)"
        >
          <template #icon>
            <van-icon name="contact" size="24" />
          </template>
        </van-cell>
      </van-cell-group>
    </van-list>
    
    <van-empty v-if="!loading && students.length === 0" description="暂无学员数据" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { studentApi } from '../api'
import { showToast } from 'vant'

const router = useRouter()
const students = ref([])
const loading = ref(false)
const finished = ref(false)
const searchValue = ref('')

const fetchStudents = async () => {
  try {
    loading.value = true
    let response
    if (searchValue.value.trim()) {
      const isPhone = /^\d+$/.test(searchValue.value)
      response = await studentApi.search({
        [isPhone ? 'phone' : 'name']: searchValue.value
      })
    } else {
      response = await studentApi.getAll()
    }
    students.value = response.data
    finished.value = true
  } catch (error) {
    showToast('获取学员列表失败')
  } finally {
    loading.value = false
  }
}

const onLoad = () => {
  fetchStudents()
}

const onSearch = () => {
  students.value = []
  finished.value = false
  fetchStudents()
}

const goBack = () => {
  router.push('/')
}

const goToAddStudent = () => {
  router.push('/students/add')
}

const goToDetail = (id) => {
  router.push(`/students/${id}`)
}

onMounted(() => {
  fetchStudents()
})
</script>

<style scoped>
.students {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}
</style>
