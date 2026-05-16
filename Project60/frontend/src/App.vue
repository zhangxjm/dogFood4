<template>
  <div id="app">
    <router-view />
    <van-tabbar route>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/students" icon="user-o">学员</van-tabbar-item>
      <van-tabbar-item replace to="/courses" icon="orders-o">课程</van-tabbar-item>
      <van-tabbar-item replace to="/enroll" icon="add-o">报名</van-tabbar-item>
      <van-tabbar-item replace to="/records" icon="notes-o">课时</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-bottom: 50px;
}

.page-container {
  padding: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  padding: 0 16px;
}

.card-item {
  margin-bottom: 12px;
}
</style>
