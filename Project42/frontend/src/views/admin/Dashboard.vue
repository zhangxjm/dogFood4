<template>
  <div class="admin-dashboard">
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h2>管理后台</h2>
          <div>
            <router-link to="/admin/article/new" class="btn btn-primary me-2">新建文章</router-link>
            <router-link to="/" class="btn btn-outline-secondary">返回首页</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h3 class="card-title">{{ stats.total_articles || 0 }}</h3>
            <p class="card-text text-muted">文章总数</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h3 class="card-title">{{ stats.total_comments || 0 }}</h3>
            <p class="card-text text-muted">评论总数</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h3 class="card-title">{{ stats.total_views || 0 }}</h3>
            <p class="card-text text-muted">总浏览量</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center text-warning">
          <div class="card-body">
            <h3 class="card-title">{{ stats.pending_comments || 0 }}</h3>
            <p class="card-text">待审核评论</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-2">
        <div class="list-group">
          <router-link to="/admin/articles" class="list-group-item list-group-item-action">文章管理</router-link>
          <router-link to="/admin/categories" class="list-group-item list-group-item-action">分类管理</router-link>
          <router-link to="/admin/tags" class="list-group-item list-group-item-action">标签管理</router-link>
          <router-link to="/admin/comments" class="list-group-item list-group-item-action">评论管理</router-link>
          <router-link to="/admin/stats" class="list-group-item list-group-item-action">访问统计</router-link>
        </div>
      </div>
      <div class="col-md-10">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { statsAPI } from '../../api'

const stats = ref({})

onMounted(async () => {
  try {
    const response = await statsAPI.dashboard()
    stats.value = response.data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
})
</script>
