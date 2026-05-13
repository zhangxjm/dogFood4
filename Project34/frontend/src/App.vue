<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="logo">
        <el-icon><Reading /></el-icon>
        <span>我的书单</span>
      </div>
      <el-menu
        class="sidebar-menu"
        :default-active="$route.path"
        router
        background-color="transparent"
        text-color="#bfcbd9"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/books">
          <el-icon><Collection /></el-icon>
          <span>书单管理</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><FolderOpened /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
      </el-menu>
    </aside>
    <main class="main-container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>
