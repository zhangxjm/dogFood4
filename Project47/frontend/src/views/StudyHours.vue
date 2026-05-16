<template>
  <div class="study-hours">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学时记录</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增学时
          </el-button>
        </div>
      </template>
      <el-table :data="studyHours" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="studentId" label="学员ID" />
        <el-table-column prop="coachId" label="教练ID" />
        <el-table-column prop="subject" label="科目">
          <template #default="{ row }">
            <el-tag type="success">科目{{ row.subject }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hours" label="学时(h)" />
        <el-table-column prop="studyDate" label="学习日期">
          <template #default="{ row }">
            {{ formatDate(row.studyDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学时' : '新增学时'"
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
        <el-form-item label="学时">
          <el-input-number v-model="form.hours" :min="0.5" :step="0.5" :precision="1" />
        </el-form-item>
        <el-form-item label="学习日期">
          <el-date-picker v-model="form.studyDate" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
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
import { studyHourApi, studentApi, coachApi } from '../api'

const studyHours = ref([])
const students = ref([])
const coaches = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  studentId: null,
  coachId: null,
  subject: 1,
  hours: 1,
  studyDate: null,
  remark: ''
})

const loadStudyHours = async () => {
  try {
    const data = await studyHourApi.list()
    studyHours.value = data || []
  } catch (error) {
    ElMessage.error('加载学时记录失败')
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
  isEdit.value = false
  form.value = {
    studentId: null,
    coachId: null,
    subject: 1,
    hours: 1,
    studyDate: null,
    remark: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该学时记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await studyHourApi.delete(row.id)
    ElMessage.success('删除成功')
    loadStudyHours()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await studyHourApi.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await studyHourApi.create(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadStudyHours()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadStudyHours()
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
