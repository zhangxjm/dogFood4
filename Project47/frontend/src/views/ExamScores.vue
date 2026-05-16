<template>
  <div class="exam-scores">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>考试成绩</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            录入成绩
          </el-button>
        </div>
      </template>
      <el-table :data="examScores" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="studentId" label="学员ID" />
        <el-table-column prop="subject" label="科目">
          <template #default="{ row }">
            <el-tag type="success">科目{{ row.subject }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="分数" />
        <el-table-column prop="examDate" label="考试日期">
          <template #default="{ row }">
            {{ formatDate(row.examDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="isPassed" label="是否通过">
          <template #default="{ row }">
            <el-tag :type="row.isPassed === 1 ? 'success' : 'danger'">
              {{ row.isPassed === 1 ? '通过' : '未通过' }}
            </el-tag>
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
      :title="isEdit ? '编辑成绩' : '录入成绩'"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="学员">
          <el-select v-model="form.studentId" style="width: 100%" placeholder="请选择学员">
            <el-option v-for="s in students" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="科目">
          <el-select v-model="form.subject" style="width: 100%">
            <el-option :label="'科目' + i" :value="i" v-for="i in 4" :key="i" />
          </el-select>
        </el-form-item>
        <el-form-item label="分数">
          <el-input-number v-model="form.score" :min="0" :max="100" :precision="1" />
        </el-form-item>
        <el-form-item label="考试日期">
          <el-date-picker v-model="form.examDate" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="是否通过">
          <el-radio-group v-model="form.isPassed">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="0">未通过</el-radio>
          </el-radio-group>
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
import { examScoreApi, studentApi } from '../api'

const examScores = ref([])
const students = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  studentId: null,
  subject: 1,
  score: 0,
  examDate: null,
  isPassed: 1,
  remark: ''
})

const loadExamScores = async () => {
  try {
    const data = await examScoreApi.list()
    examScores.value = data || []
  } catch (error) {
    ElMessage.error('加载成绩列表失败')
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

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    studentId: null,
    subject: 1,
    score: 0,
    examDate: null,
    isPassed: 1,
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
    await ElMessageBox.confirm('确定要删除该成绩记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await examScoreApi.delete(row.id)
    ElMessage.success('删除成功')
    loadExamScores()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await examScoreApi.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await examScoreApi.create(form.value)
      ElMessage.success('录入成功')
    }
    dialogVisible.value = false
    loadExamScores()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '录入失败')
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadExamScores()
  loadStudents()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
