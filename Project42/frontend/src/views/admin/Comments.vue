<template>
  <div class="admin-comments">
    <h3 class="mb-4">评论管理</h3>
    
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
          全部评论
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
          待审核 <span class="badge bg-secondary">{{ pendingCount }}</span>
        </button>
      </li>
    </ul>
    
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>文章</th>
            <th>作者</th>
            <th>邮箱</th>
            <th>内容</th>
            <th>状态</th>
            <th>IP</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comment in filteredComments" :key="comment.id">
            <td>{{ comment.id }}</td>
            <td>{{ comment.article_title || '-' }}</td>
            <td>{{ comment.author_name }}</td>
            <td>{{ comment.author_email }}</td>
            <td>{{ comment.content.substring(0, 50) }}{{ comment.content.length > 50 ? '...' : '' }}</td>
            <td>
              <span class="badge" :class="getStatusClass(comment.status)">
                {{ getStatusText(comment.status) }}
              </span>
            </td>
            <td>{{ comment.ip_address || '-' }}</td>
            <td>{{ formatDate(comment.created_at) }}</td>
            <td>
              <button v-if="comment.status === 'pending'" class="btn btn-sm btn-outline-success me-1" @click="approveComment(comment.id)">
                通过
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="rejectComment(comment.id)">
                拒绝
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredComments.length === 0" class="text-center py-5">
      <p class="text-muted">暂无评论</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { commentsAPI } from '../../api'

const comments = ref([])
const activeTab = ref('all')

const pendingCount = computed(() => 
  comments.value.filter(c => c.status === 'pending').length
)

const filteredComments = computed(() => {
  if (activeTab.value === 'pending') {
    return comments.value.filter(c => c.status === 'pending')
  }
  return comments.value
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const getStatusClass = (status) => {
  switch (status) {
    case 'approved': return 'bg-success'
    case 'rejected': return 'bg-danger'
    default: return 'bg-warning'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    default: return '待审核'
  }
}

const loadComments = async () => {
  try {
    const response = await commentsAPI.list({ page_size: 100 })
    comments.value = response.data.results || response.data
  } catch (error) {
    console.error('Failed to load comments:', error)
  }
}

const approveComment = async (id) => {
  try {
    await commentsAPI.approve(id)
    loadComments()
  } catch (error) {
    console.error('Failed to approve comment:', error)
  }
}

const rejectComment = async (id) => {
  try {
    await commentsAPI.reject(id)
    loadComments()
  } catch (error) {
    console.error('Failed to reject comment:', error)
  }
}

onMounted(() => {
  loadComments()
})
</script>
