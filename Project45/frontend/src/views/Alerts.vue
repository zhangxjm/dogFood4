<template>
  <div class="alerts">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="search-form">
            <el-select v-model="searchForm.is_read" placeholder="全部状态" clearable style="width: 150px" @change="fetchData">
              <el-option label="未读" :value="false" />
              <el-option label="已读" :value="true" />
            </el-select>
            <el-button type="primary" @click="handleMarkAllRead" :disabled="unreadCount === 0">
              <el-icon><Check /></el-icon>
              全部已读
            </el-button>
          </div>
          <div class="header-right">
            <el-tag type="danger" v-if="unreadCount > 0">未读: {{ unreadCount }}</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="product_sku" label="SKU" width="120" />
        <el-table-column prop="product_name" label="商品名称" />
        <el-table-column prop="current_stock" label="当前库存" width="120">
          <template #default="scope">
            <el-tag type="danger" size="small">{{ scope.row.current_stock }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="min_stock" label="最低库存" width="100" />
        <el-table-column prop="alert_message" label="预警信息" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_read ? 'info' : 'danger'" size="small">
              {{ scope.row.is_read ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleMarkRead(scope.row)"
              v-if="!scope.row.is_read"
            >
              标记已读
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="tableData.length === 0 && !loading" description="暂无预警记录" />

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAlerts, markAlertRead, markAllAlertsRead, deleteAlert, getUnreadAlertCount } from '@/api/alert'

const tableData = ref([])
const loading = ref(false)
const unreadCount = ref(0)

const searchForm = reactive({
  is_read: null
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size
    }
    if (searchForm.is_read !== null) {
      params.is_read = searchForm.is_read
    }
    const res = await getAlerts(params)
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadAlertCount()
    unreadCount.value = res.unread_count
  } catch (error) {
    console.error(error)
  }
}

const handleMarkRead = async (row) => {
  try {
    await markAlertRead(row.id)
    ElMessage.success('标记成功')
    fetchData()
    fetchUnreadCount()
  } catch (error) {
    console.error(error)
  }
}

const handleMarkAllRead = async () => {
  ElMessageBox.confirm('确定要将所有未读预警标记为已读吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await markAllAlertsRead()
      ElMessage.success('操作成功')
      fetchData()
      fetchUnreadCount()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条预警记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAlert(row.id)
      ElMessage.success('删除成功')
      fetchData()
      fetchUnreadCount()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
  fetchUnreadCount()
})
</script>

<style scoped>
.alerts {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  display: flex;
  gap: 10px;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}
</style>
