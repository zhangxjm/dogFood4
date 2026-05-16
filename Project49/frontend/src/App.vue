<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">🏋️ 健身房管理</div>
        <div class="nav-links">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">首页</router-link>
          <router-link to="/members" class="nav-link" :class="{ active: $route.path === '/members' }">会员</router-link>
          <router-link to="/appointments" class="nav-link" :class="{ active: $route.path === '/appointments' }">预约</router-link>
          <router-link to="/transactions" class="nav-link" :class="{ active: $route.path === '/transactions' }">消费</router-link>
          <router-link to="/reminders" class="nav-link" :class="{ active: $route.path === '/reminders' }">提醒</router-link>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
</style>