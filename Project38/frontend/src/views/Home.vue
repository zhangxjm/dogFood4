<template>
  <div class="home">
    <van-nav-bar title="少儿兴趣班管理" />
    
    <div class="content">
      <van-grid :column-num="2">
        <van-grid-item icon="friends-o" text="学员管理" @click="goToStudents" />
        <van-grid-item icon="orders-o" text="课程管理" @click="goToCourses" />
      </van-grid>
      
      <div class="welcome">
        <h2>欢迎使用少儿兴趣班管理系统</h2>
        <p>简单易用的学员信息管理平台</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToStudents = () => {
  router.push('/students')
}

const goToCourses = () => {
  router.push('/courses')
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 20px;
}

.welcome {
  margin-top: 40px;
  text-align: center;
  color: #969799;
}

.welcome h2 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #323233;
}
</style>
