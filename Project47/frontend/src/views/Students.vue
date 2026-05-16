<template>
  <div class="students">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学员列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增学员
          </el-button>
        </div>
      </template>
      <el-table :data="students" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="gender" label="性别">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? 'primary' : 'danger'">
              {{ row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="idCard" label="身份证号" />
        <el-table-column prop="currentSubject" label="当前科目">
          <template #default="{ row }">
            <el-tag type="success">科目{{ row.currentSubject }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '学习中' : '已毕业' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enrollDate" label="报名日期">
          <template #default="{ row }">
            {{ formatDate(row.enrollDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学员' : '新增学员'"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="form.idCard" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" />
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
import { studentApi } from '../api'

const students = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  name: '',
  gender: '男',
  phone: '',
  idCard: '',
  address: ''
})

const loadStudents = async () => {
  try {
    const data = await studentApi.list()
    students.value = data || []
  } catch (error) {
    ElMessage.error('加载学员列表失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    name: '',
    gender: '男',
    phone: '',
    idCard: '',
    address: ''
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
    await ElMessageBox.confirm('确定要删除该学员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await studentApi.delete(row.id)
    ElMessage.success('删除成功')
    loadStudents()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await studentApi.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await studentApi.create(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadStudents()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
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
