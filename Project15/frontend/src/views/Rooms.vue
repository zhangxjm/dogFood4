<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h3 style="margin: 0">宿舍信息管理</h3>
      <el-button type="primary" @click="handleAdd">新增宿舍</el-button>
    </div>

    <el-table :data="rooms" stripe border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="building" label="楼栋" width="120" />
      <el-table-column prop="floor" label="楼层" width="80" />
      <el-table-column prop="room_number" label="房间号" width="120" />
      <el-table-column prop="capacity" label="容量" width="80" />
      <el-table-column prop="current_num" label="当前人数" width="100" />
      <el-table-column prop="description" label="备注" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="success" link @click="showResidents(scope.row)">查看住户</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑宿舍' : '新增宿舍'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="楼栋">
          <el-input v-model="form.building" placeholder="如：A栋" />
        </el-form-item>
        <el-form-item label="楼层">
          <el-input-number v-model="form.floor" :min="1" :max="20" />
        </el-form-item>
        <el-form-item label="房间号">
          <el-input v-model="form.room_number" placeholder="如：101" />
        </el-form-item>
        <el-form-item label="容量">
          <el-input-number v-model="form.capacity" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="residentsDialogVisible" title="住户列表" width="600px">
      <el-table :data="roomResidents" stripe>
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="student_id" label="学号" />
        <el-table-column prop="major" label="专业" />
        <el-table-column prop="gender" label="性别" />
        <el-table-column prop="phone" label="电话" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roomApi } from '../api'

const rooms = ref([])
const dialogVisible = ref(false)
const residentsDialogVisible = ref(false)
const roomResidents = ref([])
const isEdit = ref(false)
const currentId = ref(null)

const form = ref({
  building: '',
  floor: 1,
  room_number: '',
  capacity: 4,
  description: ''
})

const fetchRooms = async () => {
  const res = await roomApi.list()
  rooms.value = res.data.data || []
}

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    building: '',
    floor: 1,
    room_number: '',
    capacity: 4,
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await roomApi.update(currentId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await roomApi.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchRooms()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除宿舍 ${row.room_number} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await roomApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchRooms()
  }).catch(() => {})
}

const showResidents = async (row) => {
  const res = await roomApi.getResidents(row.id)
  roomResidents.value = res.data.data || []
  residentsDialogVisible.value = true
}

onMounted(() => {
  fetchRooms()
})
</script>
