<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2>读者管理</h2>
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon>
        新增读者
      </el-button>
    </div>

    <el-card shadow="hover">
      <el-table :data="readers" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === '教师' ? 'danger' : row.type === '学生' ? 'warning' : 'info'">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="maxBorrow" label="最大借阅" width="100" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑读者' : '新增读者'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="form.idCard" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="普通读者" value="普通读者" />
            <el-option label="学生" value="学生" />
            <el-option label="教师" value="教师" />
          </el-select>
        </el-form-item>
        <el-form-item label="最大借阅">
          <el-input-number v-model="form.maxBorrow" :min="1" />
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
import { getReaders, createReader, updateReader, deleteReader } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const readers = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  name: '',
  phone: '',
  email: '',
  idCard: '',
  type: '普通读者',
  maxBorrow: 5
})

const loadReaders = async () => {
  try {
    const res = await getReaders()
    readers.value = res.data.data
  } catch (error) {
    ElMessage.error('加载读者列表失败')
  }
}

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true
    form.value = { ...row }
  } else {
    isEdit.value = false
    form.value = {
      name: '',
      phone: '',
      email: '',
      idCard: '',
      type: '普通读者',
      maxBorrow: 5
    }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value && form.value.id) {
      await updateReader(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      const newForm = { ...form.value }
      delete newForm.id
      await createReader(newForm)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadReaders()
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error((isEdit.value && form.value.id) ? '更新失败' : '创建失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这位读者吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteReader(id)
    ElMessage.success('删除成功')
    loadReaders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadReaders()
})
</script>
