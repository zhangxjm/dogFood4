<template>
  <div>
    <div class="page-header">
      <div style="display: flex; align-items: center;">
        <el-button @click="goBack" style="margin-right: 16px;">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1>书籍详情</h1>
      </div>
    </div>

    <div v-if="book" class="card-container">
      <div style="display: flex; gap: 32px;">
        <div style="flex-shrink: 0; width: 200px;">
          <div v-if="book.coverUrl" style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <img :src="book.coverUrl" :alt="book.title" style="width: 100%; display: block;" />
          </div>
          <div v-else class="book-cover-placeholder" style="height: 280px; border-radius: 8px;">
            <el-icon style="font-size: 64px;"><Picture /></el-icon>
          </div>
        </div>
        <div style="flex: 1;">
          <h2 style="font-size: 28px; font-weight: 600; margin-bottom: 16px;">{{ book.title }}</h2>
          <div style="margin-bottom: 12px;">
            <span :class="['status-tag', getStatusClass(book.status)]">
              {{ getStatusLabel(book.status) }}
            </span>
            <el-rate v-if="book.rating" :model-value="book.rating" disabled style="margin-left: 16px;" />
          </div>
          <el-descriptions :column="2" border style="margin-bottom: 24px;">
            <el-descriptions-item label="作者">
              {{ book.author || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="出版社">
              {{ book.publisher || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="出版日期">
              {{ book.publishDate || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="ISBN">
              {{ book.isbn || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="分类">
              <span v-if="book.category" style="display: flex; align-items: center;">
                <span class="category-color-dot" :style="{ backgroundColor: book.category.color }"></span>
                {{ book.category.name }}
              </span>
              <span v-else>未分类</span>
            </el-descriptions-item>
            <el-descriptions-item label="阅读进度">
              <span v-if="book.totalPages">
                {{ book.currentPage || 0 }} / {{ book.totalPages }} 页
                <el-progress
                  v-if="book.totalPages"
                  :percentage="Math.round(((book.currentPage || 0) / book.totalPages) * 100)"
                  :stroke-width="8"
                  style="margin-top: 8px;"
                />
              </span>
              <span v-else>未知</span>
            </el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <el-tag v-for="tag in book.tags ? book.tags.split(',') : []" :key="tag" style="margin-right: 8px;">
                {{ tag.trim() }}
              </el-tag>
              <span v-if="!book.tags">无</span>
            </el-descriptions-item>
            <el-descriptions-item label="简介" :span="2">
              <div style="white-space: pre-wrap; line-height: 1.8;">
                {{ book.description || '暂无简介' }}
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>

    <div class="card-container" style="margin-top: 24px;">
      <div class="page-header" style="margin-bottom: 16px;">
        <h3 style="margin: 0;">读书笔记</h3>
        <el-button type="primary" @click="handleAddNote">
          <el-icon><Plus /></el-icon>
          添加笔记
        </el-button>
      </div>

      <el-empty v-if="notes.length === 0" description="暂无读书笔记" />

      <div v-else>
        <el-card v-for="note in notes" :key="note.id" class="note-card" shadow="hover">
          <div class="note-header">
            <div>
              <span v-if="note.chapter" style="font-weight: 600; margin-right: 16px;">
                <el-icon><Reading /></el-icon>
                {{ note.chapter }}
              </span>
              <span v-if="note.pageNumber" style="color: #909399; font-size: 13px;">
                第 {{ note.pageNumber }} 页
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #909399; font-size: 13px;">
                {{ formatDate(note.createdAt) }}
              </span>
              <el-button size="small" text type="primary" @click="handleEditNote(note)">
                编辑
              </el-button>
              <el-button size="small" text type="danger" @click="handleDeleteNote(note)">
                删除
              </el-button>
            </div>
          </div>
          <div class="note-content">{{ note.content }}</div>
        </el-card>
      </div>
    </div>

    <el-dialog
      v-model="noteDialogVisible"
      :title="noteDialogTitle"
      width="600px"
    >
      <el-form :model="noteForm" label-width="80px">
        <el-form-item label="章节">
          <el-input v-model="noteForm.chapter" placeholder="请输入章节名称" />
        </el-form-item>
        <el-form-item label="页码">
          <el-input-number v-model="noteForm.pageNumber" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="noteForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入笔记内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitNote">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { bookApi, noteApi } from '@/api'

const route = useRoute()
const router = useRouter()

const book = ref(null)
const notes = ref([])
const noteDialogVisible = ref(false)
const noteDialogTitle = ref('')
const isNoteEdit = ref(false)

const noteForm = ref({
  id: null,
  content: '',
  chapter: '',
  pageNumber: null
})

const fetchBook = async () => {
  try {
    const res = await bookApi.getById(route.params.id)
    book.value = res.data
  } catch (error) {
    ElMessage.error('获取书籍详情失败')
    goBack()
  }
}

const fetchNotes = async () => {
  try {
    const res = await noteApi.getByBookId(route.params.id)
    notes.value = res.data
  } catch (error) {
    ElMessage.error('获取读书笔记失败')
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

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const handleAddNote = () => {
  isNoteEdit.value = false
  noteDialogTitle.value = '添加笔记'
  noteForm.value = {
    id: null,
    content: '',
    chapter: '',
    pageNumber: null
  }
  noteDialogVisible.value = true
}

const handleEditNote = (note) => {
  isNoteEdit.value = true
  noteDialogTitle.value = '编辑笔记'
  noteForm.value = { ...note }
  noteDialogVisible.value = true
}

const handleSubmitNote = async () => {
  if (!noteForm.value.content) {
    ElMessage.warning('请输入笔记内容')
    return
  }
  
  try {
    if (isNoteEdit.value) {
      await noteApi.update(route.params.id, noteForm.value.id, noteForm.value)
      ElMessage.success('更新成功')
    } else {
      await noteApi.create(route.params.id, noteForm.value)
      ElMessage.success('添加成功')
    }
    noteDialogVisible.value = false
    fetchNotes()
  } catch (error) {
    ElMessage.error(isNoteEdit.value ? '更新失败' : '添加失败')
  }
}

const handleDeleteNote = (note) => {
  ElMessageBox.confirm('确定要删除这条笔记吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await noteApi.delete(route.params.id, note.id)
      ElMessage.success('删除成功')
      fetchNotes()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const goBack = () => {
  router.push('/books')
}

onMounted(() => {
  fetchBook()
  fetchNotes()
})
</script>
