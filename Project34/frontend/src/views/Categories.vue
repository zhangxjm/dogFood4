<template>
  <div>
    <div class="page-header">
      <h1>分类管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加分类
      </el-button>
    </div>

    <div class="card-container">
      <el-empty v-if="categories.length === 0" description="暂无分类，点击右上角添加" />

      <el-row :gutter="20" v-else>
        <el-col :span="8" v-for="cat in categories" :key="cat.id">
          <el-card class="book-card" shadow="hover">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span class="category-color-dot" :style="{ backgroundColor: cat.color, width: '20px', height: '20px' }"></span>
              <span style="font-weight: 600; font-size: 18px; margin-left: 8px;">{{ cat.name }}</span>
            </div>
            <div style="color: #909399; margin-bottom: 12px;">
              {{ cat.description || '暂无描述' }}
            </div>
            <div style="margin-bottom: 12px;">
              <el-tag type="info">书籍数量: {{ cat.books ? cat.books.length : 0 }}</el-tag>
            </div>
            <div style="display: flex; gap: 8px;">
              <el-button size="small" @click="handleEdit(cat)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(cat)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类名称" required>
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="标签颜色" required>
          <el-color-picker v-model="form.color" show-alpha />
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
import { categoryApi } from '@/api'

const categories = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

const form = ref({
  id: null,
  name: '',
  description: '',
  color: '#409eff'
})

const fetchCategories = async () => {
  try {
    const res = await categoryApi.getAll()
    categories.value = res.data
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加分类'
  form.value = {
    id: null,
    name: '',
    description: '',
    color: '#409eff'
  }
  dialogVisible.value = true
}

const handleEdit = (category) => {
  isEdit.value = true
  dialogTitle.value = '编辑分类'
  form.value = { ...category }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  if (!form.value.color) {
    ElMessage.warning('请选择标签颜色')
    return
  }
  
  try {
    if (isEdit.value) {
      await categoryApi.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await categoryApi.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchCategories()
  } catch (error) {
    ElMessage.error(error.response?.data?.error || (isEdit.value ? '更新失败' : '添加失败'))
  }
}

const handleDelete = (category) => {
  ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await categoryApi.delete(category.id)
      ElMessage.success('删除成功')
      fetchCategories()
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchCategories()
})
</script>
