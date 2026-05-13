<template>
  <div class="student-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学生列表</span>
          <div class="header-actions">
            <el-select
              v-model="selectedClassId"
              placeholder="按班级筛选"
              clearable
              style="width: 200px; margin-right: 10px"
              @change="loadStudents"
            >
              <el-option
                v-for="c in classes"
                :key="c.id"
                :label="`${c.grade} - ${c.name}`"
                :value="c.id"
              />
            </el-select>
            <el-button type="primary" @click="openStudentDialog()">
              添加学生
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="students" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="student_no" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column label="班级" width="150">
          <template #default="scope">
            {{ scope.row.class_info ? `${scope.row.class_info.grade} - ${scope.row.class_info.name}` : '未分配' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openStudentDialog(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="success" @click="openScoreDialog(scope.row)">
              成绩
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="confirmDelete(scope.row.id, scope.row.name)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="studentDialogVisible"
      :title="isEdit ? '编辑学生' : '添加学生'"
      width="500px"
    >
      <el-form :model="studentForm" label-width="80px">
        <el-form-item label="学号">
          <el-input v-model="studentForm.student_no" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="studentForm.name" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="studentForm.gender">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="studentForm.age" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="studentForm.class_id" placeholder="选择班级" clearable>
            <el-option
              v-for="c in classes"
              :key="c.id"
              :label="`${c.grade} - ${c.name}`"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="studentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStudent">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="scoreDialogVisible"
      :title="`${currentStudent?.name} 的成绩`"
      width="600px"
    >
      <el-card style="margin-bottom: 20px">
        <el-form :inline="true" :model="scoreForm" label-width="60px">
          <el-form-item label="科目">
            <el-input v-model="scoreForm.subject" placeholder="如：数学" />
          </el-form-item>
          <el-form-item label="分数">
            <el-input-number v-model="scoreForm.score_value" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="日期">
            <el-input v-model="scoreForm.exam_date" placeholder="如：2024-01" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addScore">添加成绩</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <el-table :data="studentScores" stripe>
        <el-table-column prop="subject" label="科目" />
        <el-table-column prop="score_value" label="分数" />
        <el-table-column prop="exam_date" label="考试日期" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button
              size="small"
              type="danger"
              @click="deleteScore(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getScores,
  createScore,
  deleteScore as apiDeleteScore,
  getClasses
} from '../api'

const students = ref([])
const classes = ref([])
const selectedClassId = ref(null)

const studentDialogVisible = ref(false)
const isEdit = ref(false)
const studentForm = ref({
  id: null,
  student_no: '',
  name: '',
  gender: '男',
  age: 18,
  class_id: null
})

const scoreDialogVisible = ref(false)
const currentStudent = ref(null)
const studentScores = ref([])
const scoreForm = ref({
  subject: '',
  score_value: 80,
  exam_date: ''
})

const loadClasses = async () => {
  const res = await getClasses()
  classes.value = res.data
}

const loadStudents = async () => {
  const res = await getStudents(selectedClassId.value)
  students.value = res.data
}

const openStudentDialog = (student = null) => {
  if (student) {
    isEdit.value = true
    studentForm.value = { ...student, class_id: student.class_id }
  } else {
    isEdit.value = false
    studentForm.value = {
      id: null,
      student_no: '',
      name: '',
      gender: '男',
      age: 18,
      class_id: null
    }
  }
  studentDialogVisible.value = true
}

const saveStudent = async () => {
  try {
    if (!studentForm.value.student_no || !studentForm.value.name) {
      ElMessage.warning('学号和姓名不能为空')
      return
    }
    if (isEdit.value) {
      await updateStudent(studentForm.value.id, studentForm.value)
      ElMessage.success('更新成功')
    } else {
      await createStudent(studentForm.value)
      ElMessage.success('添加成功')
    }
    studentDialogVisible.value = false
    loadStudents()
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || '操作失败')
  }
}

const confirmDelete = async (id, name) => {
  try {
    await ElMessageBox.confirm(`确定要删除学生 "${name}" 吗？`, '提示', {
      type: 'warning'
    })
    await deleteStudent(id)
    ElMessage.success('删除成功')
    loadStudents()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const openScoreDialog = async (student) => {
  currentStudent.value = student
  const res = await getScores(student.id)
  studentScores.value = res.data
  scoreForm.value = {
    subject: '',
    score_value: 80,
    exam_date: ''
  }
  scoreDialogVisible.value = true
}

const addScore = async () => {
  try {
    if (!scoreForm.value.subject) {
      ElMessage.warning('请填写科目')
      return
    }
    await createScore({
      student_id: currentStudent.value.id,
      ...scoreForm.value
    })
    ElMessage.success('成绩添加成功')
    const res = await getScores(currentStudent.value.id)
    studentScores.value = res.data
    scoreForm.value = {
      subject: '',
      score_value: 80,
      exam_date: ''
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || '添加失败')
  }
}

const deleteScore = async (id) => {
  try {
    await apiDeleteScore(id)
    ElMessage.success('删除成功')
    const res = await getScores(currentStudent.value.id)
    studentScores.value = res.data
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadClasses()
  loadStudents()
})
</script>

<style scoped>
.student-page {
  max-width: 1200px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  align-items: center;
}
</style>
