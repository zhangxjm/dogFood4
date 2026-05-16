<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2>图书管理</h2>
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon>
        新增图书
      </el-button>
    </div>

    <el-card shadow="hover">
      <el-table :data="books" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="书名" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="isbn" label="ISBN" width="150" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="quantity" label="总数量" width="100" />
        <el-table-column prop="available" label="可借数量" width="100">
          <template #default="{ row }">
            <el-tag :type="row.available > 0 ? 'success' : 'danger'">
              {{ row.available }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑图书' : '新增图书'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="书名">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author" />
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="form.isbn" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="form.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="form.location" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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
import { getBooks, createBook, updateBook, deleteBook } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const books = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  title: '',
  author: '',
  isbn: '',
  category: '',
  quantity: 1,
  available: 1,
  location: '',
  description: ''
})

const loadBooks = async () => {
  try {
    const res = await getBooks()
    books.value = res.data.data
  } catch (error) {
    ElMessage.error('加载图书列表失败')
  }
}

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true
    form.value = { ...row }
  } else {
    isEdit.value = false
    form.value = {
      title: '',
      author: '',
      isbn: '',
      category: '',
      quantity: 1,
      available: 1,
      location: '',
      description: ''
    }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value && form.value.id) {
      await updateBook(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      const newForm = { ...form.value }
      delete newForm.id
      newForm.available = newForm.quantity
      await createBook(newForm)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadBooks()
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error((isEdit.value && form.value.id) ? '更新失败' : '创建失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这本图书吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteBook(id)
    ElMessage.success('删除成功')
    loadBooks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadBooks()
})
</script>
