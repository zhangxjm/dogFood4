<template>
  <div>
    <nav class="navbar">
      <div class="container" style="display: flex; align-items: center; justify-content: space-between; padding: 0;">
        <h1>🚗 小区车辆登记系统</h1>
        <div style="display: flex; gap: 1rem;">
          <router-link to="/">首页</router-link>
          <router-link to="/vehicles">车辆管理</router-link>
          <router-link to="/owners">车主信息</router-link>
          <router-link to="/parking-spots">车位管理</router-link>
        </div>
      </div>
    </nav>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>
