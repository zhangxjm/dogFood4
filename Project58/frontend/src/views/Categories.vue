<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>

      <el-table :data="categories" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="500px">
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const categories = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const loading = ref(false)
const formRef = ref(null)
const form = ref({
  name: '',
  description: ''
})

const loadCategories = async () => {
  try {
    const res = await request.get('/categories')
    categories.value = res.data.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { name: '', description: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除分类「${row.name}」吗？`, '提示', {
      type: 'warning'
    })
    await request.delete(`/categories/${row.id}`)
    ElMessage.success('删除成功')
    loadCategories()
  } catch (error) {
  }
}

const handleSubmit = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入分类名称')
    return
  }

  loading.value = true
  try {
    if (isEdit.value) {
      await request.put(`/categories/${form.value.id}`, form.value)
      ElMessage.success('编辑成功')
    } else {
      await request.post('/categories', form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadCategories()
  } catch (error) {
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>
