<template>
  <div class="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">医院挂号系统</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link class="nav-link" to="/">首页</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/departments">科室管理</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/doctors">医生管理</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/schedules">排班管理</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/registration">在线挂号</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/records">挂号记录</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/statistics">出诊统计</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="container mt-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
