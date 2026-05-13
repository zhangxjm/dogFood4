<template>
  <div class="class-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>班级列表</span>
          <el-button type="primary" @click="openClassDialog()">
            添加班级
          </el-button>
        </div>
      </template>

      <el-table :data="classes" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="grade" label="年级" width="150" />
        <el-table-column prop="name" label="班级名称" width="200" />
        <el-table-column prop="created_at" label="创建时间" width="250">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
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
      v-model="classDialogVisible"
      title="添加班级"
      width="400px"
    >
      <el-form :model="classForm" label-width="80px">
        <el-form-item label="年级">
          <el-input v-model="classForm.grade" placeholder="如：高一、高三" />
        </el-form-item>
        <el-form-item label="班级名称">
          <el-input v-model="classForm.name" placeholder="如：1班、2班" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="classDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveClass">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getClasses, createClass, deleteClass } from '../api'

const classes = ref([])
const classDialogVisible = ref(false)
const classForm = ref({
  name: '',
  grade: ''
})

const loadClasses = async () => {
  const res = await getClasses()
  classes.value = res.data
}

const openClassDialog = () => {
  classForm.value = {
    name: '',
    grade: ''
  }
  classDialogVisible.value = true
}

const saveClass = async () => {
  try {
    if (!classForm.value.name || !classForm.value.grade) {
      ElMessage.warning('请填写完整信息')
      return
    }
    await createClass(classForm.value)
    ElMessage.success('添加成功')
    classDialogVisible.value = false
    loadClasses()
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || '添加失败')
  }
}

const confirmDelete = async (id, name) => {
  try {
    await ElMessageBox.confirm(`确定要删除班级 "${name}" 吗？`, '提示', {
      type: 'warning'
    })
    await deleteClass(id)
    ElMessage.success('删除成功')
    loadClasses()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.response?.data?.detail || '删除失败')
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadClasses()
})
</script>

<style scoped>
.class-page {
  max-width: 1000px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
