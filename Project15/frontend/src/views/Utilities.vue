<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h3 style="margin: 0">水电费管理</h3>
      <el-button type="primary" @click="handleAdd">录入水电费</el-button>
    </div>

    <el-card style="margin-bottom: 20px">
      <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap">
        <div>
          <span style="margin-right: 10px">月份：</span>
          <el-date-picker
            v-model="filterMonth"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            @change="handleMonthChange"
          />
        </div>
        <div>
          <span style="margin-right: 10px">房间：</span>
          <el-select v-model="filterRoom" placeholder="全部房间" clearable style="width: 200px" @change="fetchUtilities">
            <el-option
              v-for="room in rooms"
              :key="room.id"
              :label="`${room.building} - ${room.room_number}`"
              :value="room.id"
            />
          </el-select>
        </div>
        <el-button type="primary" @click="fetchAll">刷新</el-button>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <div style="font-size: 14px; color: #909399">用电总量 (度)</div>
            <div style="font-size: 28px; color: #409EFF; margin-top: 10px">{{ stats.total_electricity || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <div style="font-size: 14px; color: #909399">用水总量 (吨)</div>
            <div style="font-size: 28px; color: #67C23A; margin-top: 10px">{{ stats.total_water || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <div style="font-size: 14px; color: #909399">总费用 (元)</div>
            <div style="font-size: 28px; color: #E6A23C; margin-top: 10px">{{ stats.total_cost || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <div style="font-size: 14px; color: #909399">未缴费</div>
            <div style="font-size: 28px; color: #F56C6C; margin-top: 10px">{{ stats.unpaid_count || 0 }} / {{ stats.record_count || 0 }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-table :data="utilities" stripe border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="room_id" label="房间ID" width="100" />
      <el-table-column prop="month" label="月份" width="120" />
      <el-table-column prop="electricity" label="电费 (元)" width="120" />
      <el-table-column prop="water" label="水费 (元)" width="120" />
      <el-table-column prop="total_cost" label="合计 (元)" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'paid' ? 'success' : 'warning'">
            {{ scope.row.status === 'paid' ? '已缴费' : '未缴费' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="success" link @click="toggleStatus(scope.row)">
            {{ scope.row.status === 'paid' ? '设为未缴' : '设为已缴' }}
          </el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑水电费' : '录入水电费'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="房间">
          <el-select v-model="form.room_id" placeholder="请选择房间" style="width: 100%" :disabled="isEdit">
            <el-option
              v-for="room in rooms"
              :key="room.id"
              :label="`${room.building} - ${room.room_number}`"
              :value="room.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker
            v-model="form.month"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            style="width: 100%"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="电费">
          <el-input-number v-model="form.electricity" :min="0" :precision="2" />
          <span style="margin-left: 10px">元 (电价: 0.6元/度)</span>
        </el-form-item>
        <el-form-item label="水费">
          <el-input-number v-model="form.water" :min="0" :precision="2" />
          <span style="margin-left: 10px">元 (水价: 3.5元/吨)</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="未缴费" value="unpaid" />
            <el-option label="已缴费" value="paid" />
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
import { utilityApi, roomApi } from '../api'

const utilities = ref([])
const rooms = ref([])
const stats = ref({})
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const filterMonth = ref(new Date().toISOString().slice(0, 7))
const filterRoom = ref(null)

const form = ref({
  room_id: null,
  month: new Date().toISOString().slice(0, 7),
  electricity: 0,
  water: 0,
  status: 'unpaid'
})

const fetchUtilities = async () => {
  const params = {}
  if (filterMonth.value) params.month = filterMonth.value
  if (filterRoom.value) params.room_id = filterRoom.value
  const res = await utilityApi.list(params)
  utilities.value = res.data.data || []
}

const fetchStats = async () => {
  const res = await utilityApi.stats({ month: filterMonth.value })
  stats.value = res.data || {}
}

const fetchRooms = async () => {
  const res = await roomApi.list()
  rooms.value = res.data.data || []
}

const fetchAll = () => {
  fetchUtilities()
  fetchStats()
}

const handleMonthChange = () => {
  fetchAll()
}

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    room_id: null,
    month: new Date().toISOString().slice(0, 7),
    electricity: 0,
    water: 0,
    status: 'unpaid'
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
      await utilityApi.update(currentId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await utilityApi.create(form.value)
      ElMessage.success('录入成功')
    }
    dialogVisible.value = false
    fetchAll()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除此记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await utilityApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchAll()
  }).catch(() => {})
}

const toggleStatus = async (row) => {
  const newStatus = row.status === 'paid' ? 'unpaid' : 'paid'
  await utilityApi.update(row.id, { ...row, status: newStatus })
  ElMessage.success('状态已更新')
  fetchAll()
}

onMounted(() => {
  fetchAll()
  fetchRooms()
})
</script>
