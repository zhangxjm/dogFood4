<template>
  <div>
    <el-card>
      <template #header>
        <span>审批管理</span>
      </template>

      <el-table :data="applications" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="申领标题" />
        <el-table-column prop="user_name" label="申领人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button v-if="canApprove(row)" link type="success" @click="handleApprove(row)">通过</el-button>
            <el-button v-if="canApprove(row)" link type="danger" @click="handleReject(row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="申领详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申领标题">{{ currentApplication.title }}</el-descriptions-item>
        <el-descriptions-item label="申领人">{{ currentApplication.user_name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentApplication.status)">{{ getStatusText(currentApplication.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentApplication.created_at }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentApplication.remark }}</el-descriptions-item>
      </el-descriptions>
      <h4 style="margin-top: 20px; margin-bottom: 10px">申领物品：</h4>
      <el-table :data="currentApplication.items" border size="small">
        <el-table-column prop="supply_name" label="物品名称" />
        <el-table-column prop="quantity" label="申领数量" width="120" />
        <el-table-column prop="unit" label="单位" width="80" />
      </el-table>
    </el-dialog>

    <el-dialog v-model="rejectVisible" title="驳回申请" width="500px">
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="驳回原因">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRejectSubmit" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const applications = ref([])
const dialogVisible = ref(false)
const rejectVisible = ref(false)
const loading = ref(false)
const currentApplication = ref({})
const currentId = ref('')
const rejectForm = ref({
  reason: ''
})

const statusMap = {
  0: { text: '待审批', type: 'warning' },
  1: { text: '一级通过', type: 'primary' },
  2: { text: '二级通过', type: 'success' },
  3: { text: '已驳回', type: 'danger' },
  4: { text: '已收货', type: 'info' }
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'info'

const canApprove = (row) => {
  const role = userStore.user?.role
  if (role === 2) {
    return row.status === 0
  }
  if (role === 3) {
    return row.status === 0 || row.status === 1
  }
  return false
}

const loadApplications = async () => {
  try {
    const res = await request.get('/applications/pending')
    applications.value = res.data.data
  } catch (error) {
    console.error('加载审批失败:', error)
  }
}

const handleView = async (row) => {
  try {
    const res = await request.get(`/applications/${row.id}`)
    currentApplication.value = res.data.data
    dialogVisible.value = true
  } catch (error) {
  }
}

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要通过「${row.title}」的申领吗？`, '提示', {
      type: 'warning'
    })
    await request.post(`/applications/${row.id}/approve`)
    ElMessage.success('审批通过')
    loadApplications()
  } catch (error) {
  }
}

const handleReject = (row) => {
  currentId.value = row.id
  rejectForm.value = { reason: '' }
  rejectVisible.value = true
}

const handleRejectSubmit = async () => {
  if (!rejectForm.value.reason) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  loading.value = true
  try {
    await request.post(`/applications/${currentId.value}/reject`, {
      reason: rejectForm.value.reason
    })
    ElMessage.success('驳回成功')
    rejectVisible.value = false
    loadApplications()
  } catch (error) {
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadApplications()
})
</script>
