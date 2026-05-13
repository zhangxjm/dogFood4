<template>
  <div>
    <div class="page-header">
      <h1>书单管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加书籍
      </el-button>
    </div>

    <div class="card-container">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索书名..."
          clearable
          @clear="fetchBooks"
          @keyup.enter="fetchBooks"
          style="max-width: 300px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filterStatus"
          placeholder="按状态筛选"
          clearable
          @change="fetchBooks"
          style="max-width: 150px;"
        >
          <el-option label="想读" value="WANT_TO_READ" />
          <el-option label="在读" value="READING" />
          <el-option label="已读" value="FINISHED" />
          <el-option label="放弃" value="ABANDONED" />
        </el-select>
        <el-select
          v-model="filterCategory"
          placeholder="按分类筛选"
          clearable
          @change="fetchBooks"
          style="max-width: 150px;"
        >
          <el-option
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          />
        </el-select>
      </div>

      <el-empty v-if="books.length === 0" description="暂无书籍，点击右上角添加" />

      <el-row :gutter="20" v-else>
        <el-col :span="6" v-for="book in books" :key="book.id">
          <el-card class="book-card" shadow="hover" @click="goToDetail(book.id)">
            <div style="text-align: center; margin-bottom: 12px;">
              <div v-if="book.coverUrl" style="height: 180px; display: flex; align-items: center; justify-content: center;">
                <img :src="book.coverUrl" :alt="book.title" style="max-width: 100%; max-height: 180px; border-radius: 4px;" />
              </div>
              <div v-else class="book-cover-placeholder" style="height: 180px;">
                <el-icon style="font-size: 48px;"><Picture /></el-icon>
              </div>
            </div>
            <div style="font-weight: 600; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{ book.title }}
            </div>
            <div style="color: #909399; font-size: 13px; margin-bottom: 8px;">
              {{ book.author || '未知作者' }}
            </div>
            <div style="margin-bottom: 8px;">
              <span :class="['status-tag', getStatusClass(book.status)]">
                {{ getStatusLabel(book.status) }}
              </span>
            </div>
            <div v-if="book.category" style="display: flex; align-items: center;">
              <span class="category-color-dot" :style="{ backgroundColor: book.category.color }"></span>
              <span style="font-size: 12px; color: #909399;">{{ book.category.name }}</span>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <el-button size="small" @click.stop="handleEdit(book)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click.stop="handleDelete(book)">
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
      width="600px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="书名" required>
          <el-input v-model="form.title" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="出版社">
          <el-input v-model="form.publisher" placeholder="请输入出版社" />
        </el-form-item>
        <el-form-item label="出版日期">
          <el-date-picker
            v-model="form.publishDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="封面URL">
          <el-input v-model="form.coverUrl" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="form.isbn" placeholder="请输入ISBN" />
        </el-form-item>
        <el-form-item label="阅读状态" required>
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="想读" value="WANT_TO_READ" />
            <el-option label="在读" value="READING" />
            <el-option label="已读" value="FINISHED" />
            <el-option label="放弃" value="ABANDONED" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%;">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="{ id: cat.id, name: cat.name, color: cat.color }"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="总页数">
          <el-input-number v-model="form.totalPages" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="当前进度">
          <el-input-number v-model="form.currentPage" :min="0" :max="form.totalPages" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="评分">
          <el-rate v-model="form.rating" :max="5" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入书籍简介"
          />
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { bookApi, categoryApi } from '@/api'

const router = useRouter()

const books = ref([])
const categories = ref([])
const searchKeyword = ref('')
const filterStatus = ref('')
const filterCategory = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

const form = ref({
  id: null,
  title: '',
  author: '',
  publisher: '',
  publishDate: '',
  coverUrl: '',
  isbn: '',
  status: 'WANT_TO_READ',
  category: null,
  totalPages: null,
  currentPage: null,
  rating: 0,
  tags: '',
  description: ''
})

const fetchBooks = async () => {
  try {
    const params = {}
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (filterStatus.value) params.status = filterStatus.value
    if (filterCategory.value) params.categoryId = filterCategory.value
    
    const res = await bookApi.getAll(params)
    books.value = res.data
  } catch (error) {
    ElMessage.error('获取书籍列表失败')
  }
}

const fetchCategories = async () => {
  try {
    const res = await categoryApi.getAll()
    categories.value = res.data
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const getStatusLabel = (status) => {
  const map = {
    'WANT_TO_READ': '想读',
    'READING': '在读',
    'FINISHED': '已读',
    'ABANDONED': '放弃'
  }
  return map[status] || status
}

const getStatusClass = (status) => {
  const map = {
    'WANT_TO_READ': 'status-want-to-read',
    'READING': 'status-reading',
    'FINISHED': 'status-finished',
    'ABANDONED': 'status-abandoned'
  }
  return map[status] || ''
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加书籍'
  form.value = {
    id: null,
    title: '',
    author: '',
    publisher: '',
    publishDate: '',
    coverUrl: '',
    isbn: '',
    status: 'WANT_TO_READ',
    category: null,
    totalPages: null,
    currentPage: null,
    rating: 0,
    tags: '',
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (book) => {
  isEdit.value = true
  dialogTitle.value = '编辑书籍'
  form.value = {
    ...book,
    publishDate: book.publishDate || ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.value.title) {
    ElMessage.warning('请输入书名')
    return
  }
  
  try {
    const submitData = { ...form.value }
    
    if (isEdit.value) {
      await bookApi.update(form.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await bookApi.create(submitData)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchBooks()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  }
}

const handleDelete = (book) => {
  ElMessageBox.confirm('确定要删除这本书吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await bookApi.delete(book.id)
      ElMessage.success('删除成功')
      fetchBooks()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const goToDetail = (id) => {
  router.push(`/books/${id}`)
}

onMounted(() => {
  fetchBooks()
  fetchCategories()
})
</script>
