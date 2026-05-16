<template>
  <div class="reservations">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>预约列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增预约
          </el-button>
        </div>
      </template>
      <el-table :data="reservations" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="studentId" label="学员ID" />
        <el-table-column prop="coachId" label="教练ID" />
        <el-table-column prop="subject" label="科目">
          <template #default="{ row }">
            <el-tag type="success">科目{{ row.subject }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="timeSlot" label="时段" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已预约' : '已取消' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="handleDelete(row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="新增预约"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="学员">
          <el-select v-model="form.studentId" style="width: 100%" placeholder="请选择学员">
            <el-option v-for="s in students" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="教练">
          <el-select v-model="form.coachId" style="width: 100%" placeholder="请选择教练">
            <el-option v-for="c in coaches" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="科目">
          <el-select v-model="form.subject" style="width: 100%">
            <el-option :label="'科目' + i" :value="i" v-for="i in 4" :key="i" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="form.date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="时段">
          <el-select v-model="form.timeSlot" style="width: 100%">
            <el-option label="上午 08:00-10:00" value="08:00-10:00" />
            <el-option label="上午 10:00-12:00" value="10:00-12:00" />
            <el-option label="下午 14:00-16:00" value="14:00-16:00" />
            <el-option label="下午 16:00-18:00" value="16:00-18:00" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reservationApi, studentApi, coachApi } from '../api'

const reservations = ref([])
const students = ref([])
const coaches = ref([])
const dialogVisible = ref(false)
const form = ref({
  studentId: null,
  coachId: null,
  subject: 1,
  date: null,
  timeSlot: ''
})

const loadReservations = async () => {
  try {
    const data = await reservationApi.list()
    reservations.value = data || []
  } catch (error) {
    ElMessage.error('加载预约列表失败')
  }
}

const loadStudents = async () => {
  try {
    const data = await studentApi.list()
    students.value = data || []
  } catch (error) {
    console.error('加载学员失败:', error)
  }
}

const loadCoaches = async () => {
  try {
    const data = await coachApi.list()
    coaches.value = data || []
  } catch (error) {
    console.error('加载教练失败:', error)
  }
}

const handleAdd = () => {
  form.value = {
    studentId: null,
    coachId: null,
    subject: 1,
    date: null,
    timeSlot: ''
  }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await reservationApi.delete(row.id)
    ElMessage.success('取消成功')
    loadReservations()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    await reservationApi.create(form.value)
    ElMessage.success('预约成功')
    dialogVisible.value = false
    loadReservations()
  } catch (error) {
    ElMessage.error('预约失败: ' + error)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadReservations()
  loadStudents()
  loadCoaches()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
