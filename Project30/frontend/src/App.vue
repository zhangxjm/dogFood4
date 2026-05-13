<template>
  <el-container style="height: 100vh">
    <el-aside width="220px" style="background-color: #304156">
      <div style="color: white; text-align: center; padding: 20px; font-size: 18px; font-weight: bold">
        办公用品申领系统
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><Folder /></el-icon>
          <span>物品分类</span>
        </el-menu-item>
        <el-menu-item index="/item">
          <el-icon><Box /></el-icon>
          <span>物品库存</span>
        </el-menu-item>
        <el-menu-item index="/employee">
          <el-icon><User /></el-icon>
          <span>员工管理</span>
        </el-menu-item>
        <el-menu-item index="/requisition">
          <el-icon><Tickets /></el-icon>
          <span>物品申领</span>
        </el-menu-item>
        <el-menu-item index="/requisition-record">
          <el-icon><Document /></el-icon>
          <span>申领记录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="background-color: #fff; border-bottom: 1px solid #e6e6e6">
        <div style="line-height: 60px; font-size: 16px; color: #303133">
          {{ pageTitle }}
        </div>
      </el-header>
      <el-main style="background-color: #f5f7fa; padding: 20px">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title || '办公用品申领系统')
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
