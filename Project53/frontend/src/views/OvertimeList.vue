<template>
  <div class="overtime-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>加班登记</span>
          <el-button type="primary" @click="dialogVisible = true">
            <el-icon><Plus /></el-icon>
            新增登记
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="type" label="加班类型" width="120">
          <template #default="{ row }">{{ getTypeText(row.type) }}</template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="时间段" width="200">
          <template #default="{ row }">{{ row.startTime }} - {{ row.endTime }}</template>
        </el-table-column>
        <el-table-column prop="hours" label="时长" width="100">
          <template #default="{ row }">{{ row.hours }} 小时</template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="danger" size="small" @click="handleDelete(row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增加班登记" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="加班类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="工作日" value="weekday" />
            <el-option label="周末" value="weekend" />
            <el-option label="节假日" value="holiday" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker v-model="form.startTime" format="HH:mm" value-format="HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker v-model="form.endTime" format="HH:mm" value-format="HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="加班原因">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const tableData = ref([])
const dialogVisible = ref(false)
const form = ref({
  type: '',
  date: '',
  startTime: '',
  endTime: '',
  reason: ''
})

const getUserId = () => localStorage.getItem('userId')

const loadData = async () => {
  const userId = getUserId()
  if (!userId) return
  try {
    const res = await axios.get('/api/overtime', { params: { userId } })
    tableData.value = res.data
  } catch (error) {
    console.error('加载加班记录失败', error)
  }
}

const handleSubmit = async () => {
  const userId = getUserId()
  if (!userId) {
    ElMessage.error('请先初始化用户')
    return
  }
  if (!form.value.type || !form.value.date || !form.value.startTime || !form.value.endTime) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    await axios.post('/api/overtime', { ...form.value, userId })
    ElMessage.success('提交成功')
    dialogVisible.value = false
    form.value = { type: '', date: '', startTime: '', endTime: '', reason: '' }
    loadData()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '提交失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await axios.delete(`/api/overtime/${id}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getTypeText = (type) => {
  const map = {
    weekday: '工作日',
    weekend: '周末',
    holiday: '节假日'
  }
  return map[type] || type
}

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || status
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
