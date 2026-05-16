<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2>借阅记录</h2>
      <el-button type="primary" @click="openBorrowDialog">
        <el-icon><Plus /></el-icon>
        新增借阅
      </el-button>
    </div>

    <el-card shadow="hover">
      <el-table :data="borrows" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="book.title" label="书名" />
        <el-table-column prop="reader.name" label="读者" width="100" />
        <el-table-column prop="borrowDate" label="借阅日期" width="120" />
        <el-table-column prop="dueDate" label="应还日期" width="120" />
        <el-table-column prop="returnDate" label="归还日期" width="120">
          <template #default="{ row }">
            {{ row.returnDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '借阅中' ? 'warning' : 'success'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fineAmount" label="罚款金额" width="120">
          <template #default="{ row }">
            <span v-if="row.fineAmount > 0" style="color: #F56C6C; font-weight: bold">
              ¥{{ row.fineAmount.toFixed(2) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button v-if="row.status === '借阅中'" size="small" type="success" @click="handleReturn(row.id)">
              归还
            </el-button>
            <el-button v-if="row.fineAmount > 0 && !row.finePaid" size="small" type="warning" @click="handlePayFine(row.id)">
              缴纳罚款
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="borrowDialogVisible" title="新增借阅" width="500px">
      <el-form :model="borrowForm" label-width="80px">
        <el-form-item label="选择图书">
          <el-select v-model="borrowForm.bookId" style="width: 100%" placeholder="请选择图书">
            <el-option
              v-for="book in availableBooks"
              :key="book.id"
              :label="`${book.title} (可借: ${book.available})`"
              :value="book.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择读者">
          <el-select v-model="borrowForm.readerId" style="width: 100%" placeholder="请选择读者">
            <el-option
              v-for="reader in readers"
              :key="reader.id"
              :label="`${reader.name} (${reader.type})`"
              :value="reader.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="借阅天数">
          <el-input-number v-model="borrowForm.days" :min="1" :max="60" />
          <span style="margin-left: 10px; color: #909399">天</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBorrow">确定借阅</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getBorrows, createBorrow, returnBook, payFine, getBooks, getReaders } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const borrows = ref([])
const books = ref([])
const readers = ref([])
const borrowDialogVisible = ref(false)
const borrowForm = ref({
  bookId: null,
  readerId: null,
  days: 30
})

const availableBooks = computed(() => {
  return books.value.filter(book => book.available > 0)
})

const loadBorrows = async () => {
  try {
    const res = await getBorrows()
    borrows.value = res.data.data
  } catch (error) {
    ElMessage.error('加载借阅记录失败')
  }
}

const loadBooks = async () => {
  try {
    const res = await getBooks()
    books.value = res.data.data
  } catch (error) {
    ElMessage.error('加载图书列表失败')
  }
}

const loadReaders = async () => {
  try {
    const res = await getReaders()
    readers.value = res.data.data
  } catch (error) {
    ElMessage.error('加载读者列表失败')
  }
}

const openBorrowDialog = () => {
  borrowForm.value = {
    bookId: null,
    readerId: null,
    days: 30
  }
  borrowDialogVisible.value = true
}

const handleBorrow = async () => {
  if (!borrowForm.value.bookId || !borrowForm.value.readerId) {
    ElMessage.warning('请选择图书和读者')
    return
  }
  try {
    await createBorrow(borrowForm.value)
    ElMessage.success('借阅成功')
    borrowDialogVisible.value = false
    loadBorrows()
    loadBooks()
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '借阅失败')
  }
}

const handleReturn = async (id) => {
  try {
    await ElMessageBox.confirm('确定要归还这本书吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await returnBook({ recordId: id })
    ElMessage.success('归还成功')
    loadBorrows()
    loadBooks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('归还失败')
    }
  }
}

const handlePayFine = async (id) => {
  try {
    await ElMessageBox.confirm('确定要缴纳罚款吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await payFine(id)
    ElMessage.success('缴纳成功')
    loadBorrows()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('缴纳失败')
    }
  }
}

onMounted(() => {
  loadBorrows()
  loadBooks()
  loadReaders()
})
</script>
