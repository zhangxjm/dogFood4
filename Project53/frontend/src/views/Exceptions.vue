<template>
  <div class="exceptions-page">
    <el-card>
      <template #header>
        <span>异常考勤处理</span>
      </template>

      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="开始日期">
          <el-date-picker v-model="queryForm.startDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="queryForm.endDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column label="员工" width="150">
          <template #default="{ row }">
            {{ row.userId?.name || '-' }}<br />
            <el-tag type="info" size="small">{{ row.userId?.employeeId || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="签到" width="130">
          <template #default="{ row }">
            {{ formatTime(row.checkInTime) }}
            <el-tag v-if="row.checkInStatus === 'late'" type="danger" size="small">迟到</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签退" width="130">
          <template #default="{ row }">
            {{ formatTime(row.checkOutTime) }}
            <el-tag v-if="row.checkOutStatus === 'early'" type="warning" size="small">早退</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="exceptionNote" label="异常说明" show-overflow-tooltip />
        <el-table-column label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isProcessed" type="success">已处理</el-tag>
            <el-tag v-else type="warning">待处理</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="!row.isProcessed" type="primary" size="small" @click="handleProcess(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="处理异常考勤" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="form.status">
            <el-radio label="normal">正常出勤</el-radio>
            <el-radio label="half_day">半天</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="form.exceptionNote" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import * as dayjs from 'dayjs'

const queryForm = ref({
  startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD')
})
const tableData = ref([])
const dialogVisible = ref(false)
const currentId = ref('')
const form = ref({
  status: 'normal',
  exceptionNote: ''
})

const loadData = async () => {
  try {
    const res = await axios.get('/api/statistics/exceptions', { params: queryForm.value })
    tableData.value = res.data
  } catch (error) {
    console.error('加载异常记录失败', error)
  }
}

const resetQuery = () => {
  queryForm.value = {
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  }
  loadData()
}

const handleProcess = (row) => {
  currentId.value = row._id
  form.value = {
    status: 'normal',
    exceptionNote: row.exceptionNote || ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await axios.patch(`/api/attendance/${currentId.value}`, {
      status: form.value.status,
      hasException: false,
      exceptionNote: form.value.exceptionNote,
      isProcessed: true
    })
    ElMessage.success('处理成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('处理失败')
  }
}

const formatTime = (time) => {
  return time ? dayjs(time).format('HH:mm:ss') : '-'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
</style>
