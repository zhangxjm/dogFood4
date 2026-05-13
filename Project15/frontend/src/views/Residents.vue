<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h3 style="margin: 0">住宿名单管理</h3>
      <div>
        <el-button type="success" @click="handleExport">导出CSV</el-button>
        <el-button type="primary" style="margin-left: 10px" @click="handleAdd">新增住宿</el-button>
      </div>
    </div>

    <el-table :data="residents" stripe border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="student_id" label="学号" width="140" />
      <el-table-column prop="major" label="专业" width="150" />
      <el-table-column prop="gender" label="性别" width="80" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column prop="room_id" label="房间ID" width="100" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑住宿' : '新增住宿'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="form.student_id" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="form.major" placeholder="如：计算机科学" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="房间">
          <el-select v-model="form.room_id" placeholder="请选择房间" style="width: 100%">
            <el-option
              v-for="room in rooms"
              :key="room.id"
              :label="`${room.building} - ${room.room_number} (${room.current_num}/${room.capacity})`"
              :value="room.id"
            />
          </el-select>
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
import { residentApi, roomApi } from '../api'

const residents = ref([])
const rooms = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

const form = ref({
  name: '',
  student_id: '',
  major: '',
  gender: '男',
  phone: '',
  room_id: null
})

const fetchResidents = async () => {
  const res = await residentApi.list()
  residents.value = res.data.data || []
}

const fetchRooms = async () => {
  const res = await roomApi.list()
  rooms.value = res.data.data || []
}

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    name: '',
    student_id: '',
    major: '',
    gender: '男',
    phone: '',
    room_id: null
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
      await residentApi.update(currentId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await residentApi.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchResidents()
    fetchRooms()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await residentApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchResidents()
    fetchRooms()
  }).catch(() => {})
}

const handleExport = () => {
  window.open(residentApi.exportCSV(), '_blank')
}

onMounted(() => {
  fetchResidents()
  fetchRooms()
})
</script>
