<template>
  <div class="min-vh-100 bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <i class="bi bi-film me-2"></i>电影票预订系统
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">电影列表</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/orders">订单查询</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/stats">票房统计</router-link>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                管理后台
              </a>
              <ul class="dropdown-menu">
                <li><router-link class="dropdown-item" to="/admin/movies">电影管理</router-link></li>
                <li><router-link class="dropdown-item" to="/admin/schedules">场次管理</router-link></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="container py-4">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
</script>

<style>
</style>
