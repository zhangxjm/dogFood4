<template>
  <div class="rooms-page">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2 style="margin: 0">会议室管理</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        新增会议室
      </el-button>
    </div>
    
    <el-card>
      <el-table :data="rooms" style="width: 100%">
        <el-table-column prop="name" label="会议室名称" />
        <el-table-column prop="capacity" label="容纳人数" width="120" />
        <el-table-column prop="location" label="位置" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'AVAILABLE' ? 'success' : 'warning'" size="small">
              {{ scope.row.status === 'AVAILABLE' ? '可用' : '维护中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑会议室' : '新增会议室'"
      width="500px"
    >
      <el-form :model="roomForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="会议室名称" prop="name">
          <el-input v-model="roomForm.name" placeholder="请输入会议室名称" />
        </el-form-item>
        <el-form-item label="容纳人数" prop="capacity">
          <el-input-number v-model="roomForm.capacity" :min="1" :max="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="roomForm.location" placeholder="请输入位置" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="roomForm.status" style="width: 100%">
            <el-option label="可用" value="AVAILABLE" />
            <el-option label="维护中" value="MAINTENANCE" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="roomForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../utils/api'

const rooms = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)
const submitting = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

const roomForm = reactive({
  name: '',
  capacity: 10,
  location: '',
  status: 'AVAILABLE',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入会议室名称', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入容纳人数', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const fetchRooms = async () => {
  const response = await api.get('/api/rooms')
  rooms.value = response.data
}

const openDialog = (room = null) => {
  isEdit.value = !!room
  currentId.value = room?.id || null
  
  if (room) {
    roomForm.name = room.name
    roomForm.capacity = room.capacity
    roomForm.location = room.location
    roomForm.status = room.status
    roomForm.description = room.description
  } else {
    roomForm.name = ''
    roomForm.capacity = 10
    roomForm.location = ''
    roomForm.status = 'AVAILABLE'
    roomForm.description = ''
  }
  
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  
  submitting.value = true
  try {
    if (isEdit.value) {
      await api.put(`/api/rooms/${currentId.value}`, roomForm)
      ElMessage.success('更新成功')
    } else {
      await api.post('/api/rooms', roomForm)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    fetchRooms()
  } finally {
    submitting.value = false
  }
}

const handleDelete = (room) => {
  ElMessageBox.confirm(`确定要删除会议室「${room.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await api.delete(`/api/rooms/${room.id}`)
    ElMessage.success('删除成功')
    fetchRooms()
  }).catch(() => {})
}

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.rooms-page h2 {
  margin-bottom: 20px;
}
</style>
