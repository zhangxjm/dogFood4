<template>
  <div>
    <el-card shadow="hover">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>预约管理</span>
          <el-button type="primary" @click="openDialog()">
            <el-icon><Plus /></el-icon>
            新增预约
          </el-button>
        </div>
      </template>
      <el-table :data="reservations" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="宠物信息" width="200">
          <template #default="{ row }">
            <div>{{ row.pet?.petName }} ({{ row.pet?.petType }})</div>
            <div style="color: #909399; font-size: 12px">{{ row.pet?.ownerName }} - {{ row.pet?.ownerPhone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="套餐" width="150">
          <template #default="{ row }">
            <el-tag type="info">{{ row.package?.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="寄养时间" width="250">
          <template #default="{ row }">
            <div>{{ row.startDate }} 至</div>
            <div>{{ row.endDate }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="totalPrice" label="总价" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">¥{{ row.totalPrice.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-dropdown @command="(status) => updateStatus(row.id, status)">
              <el-button type="primary" size="small">
                状态更新<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pending">待确认</el-dropdown-item>
                  <el-dropdown-item command="confirmed">已确认</el-dropdown-item>
                  <el-dropdown-item command="in_progress">寄养中</el-dropdown-item>
                  <el-dropdown-item command="completed">已完成</el-dropdown-item>
                  <el-dropdown-item command="cancelled">已取消</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑预约' : '新增预约'"
      width="700px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="选择宠物" prop="petId">
          <el-select v-model="form.petId" placeholder="请选择宠物" style="width: 100%" filterable>
            <el-option
              v-for="pet in pets"
              :key="pet.id"
              :label="`${pet.petName} - ${pet.ownerName}`"
              :value="pet.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择套餐" prop="packageId">
          <el-select v-model="form.packageId" placeholder="请选择套餐" style="width: 100%">
            <el-option
              v-for="pkg in packages"
              :key="pkg.id"
              :label="`${pkg.name} - ¥${pkg.price}/天`"
              :value="pkg.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="寄养时间" prop="dateRange">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item v-if="availabilityChecked">
          <div v-if="isAvailable" style="color: #67c23a">
            <el-icon><CircleCheck /></el-icon>
            该时间段可用
          </div>
          <div v-else style="color: #f56c6c">
            <el-icon><CircleClose /></el-icon>
            该宠物在所选时间段已有预约！
          </div>
        </el-form-item>
        <el-form-item label="特殊要求" prop="specialRequests">
          <el-input
            v-model="form.specialRequests"
            type="textarea"
            :rows="3"
            placeholder="请输入特殊要求"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="checkAvailability">检查可用性</el-button>
        <el-button type="success" @click="handleSubmit" :disabled="!isAvailable">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reservationsAPI, petsAPI, packagesAPI } from '../api'
import { Plus, ArrowDown, CircleCheck, CircleClose } from '@element-plus/icons-vue'

const reservations = ref([])
const pets = ref([])
const packages = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const dateRange = ref([])
const availabilityChecked = ref(false)
const isAvailable = ref(false)

const form = reactive({
  id: null,
  petId: null,
  packageId: null,
  startDate: '',
  endDate: '',
  specialRequests: ''
})

const rules = {
  petId: [{ required: true, message: '请选择宠物', trigger: 'change' }],
  packageId: [{ required: true, message: '请选择套餐', trigger: 'change' }]
}

const statusMap = {
  pending: { text: '待确认', type: 'warning' },
  confirmed: { text: '已确认', type: 'primary' },
  in_progress: { text: '寄养中', type: 'info' },
  completed: { text: '已完成', type: 'success' },
  cancelled: { text: '已取消', type: 'danger' }
}

const getStatusText = (status) => statusMap[status]?.text || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

const loadReservations = async () => {
  try {
    const response = await reservationsAPI.getAll()
    reservations.value = response.data.data
  } catch (error) {
    ElMessage.error('加载预约数据失败')
  }
}

const loadPets = async () => {
  try {
    const response = await petsAPI.getAll()
    pets.value = response.data.data
  } catch (error) {
    ElMessage.error('加载宠物数据失败')
  }
}

const loadPackages = async () => {
  try {
    const response = await packagesAPI.getAll()
    packages.value = response.data.data
  } catch (error) {
    ElMessage.error('加载套餐数据失败')
  }
}

const openDialog = (row = null) => {
  isEdit.value = !!row
  availabilityChecked.value = false
  isAvailable.value = false
  if (row) {
    Object.assign(form, row)
    dateRange.value = [new Date(row.startDate), new Date(row.endDate)]
  } else {
    Object.assign(form, {
      id: null,
      petId: null,
      packageId: null,
      startDate: '',
      endDate: '',
      specialRequests: ''
    })
    dateRange.value = []
  }
  dialogVisible.value = true
}

const handleDateChange = (dates) => {
  if (dates && dates.length === 2) {
    form.startDate = dates[0].toISOString().split('T')[0]
    form.endDate = dates[1].toISOString().split('T')[0]
  } else {
    form.startDate = ''
    form.endDate = ''
  }
  availabilityChecked.value = false
  isAvailable.value = false
}

const checkAvailability = async () => {
  if (!form.petId || !form.startDate || !form.endDate) {
    ElMessage.warning('请先选择宠物和寄养时间')
    return
  }
  try {
    const response = await reservationsAPI.checkAvailability({
      petId: form.petId,
      startDate: form.startDate,
      endDate: form.endDate
    })
    isAvailable.value = response.data.available
    availabilityChecked.value = true
    if (isAvailable.value) {
      ElMessage.success('该时间段可用')
    } else {
      ElMessage.error('该宠物在所选时间段已有预约！')
    }
  } catch (error) {
    console.error('Check availability error:', error)
    ElMessage.error('检查可用性失败')
  }
}

const handleSubmit = async () => {
  console.log('handleSubmit called, formRef:', formRef.value, 'form:', form)
  if (!formRef.value) return
  try {
    const valid = await formRef.value.validate()
    console.log('validate result:', valid)
    
    if (!form.startDate || !form.endDate) {
      ElMessage.warning('请选择寄养时间')
      return
    }
    if (!availabilityChecked.value) {
      ElMessage.warning('请先检查可用性')
      return
    }
    if (!isAvailable.value) {
      ElMessage.error('该时间段不可用，请重新选择')
      return
    }
    console.log('Submitting form:', form)
    if (isEdit.value) {
      await reservationsAPI.update(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await reservationsAPI.create(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadReservations()
  } catch (error) {
    console.error('Submit error:', error)
    if (error !== false) {
      ElMessage.error('操作失败')
    }
  }
}

const updateStatus = async (id, status) => {
  try {
    await reservationsAPI.updateStatus(id, status)
    ElMessage.success('状态更新成功')
    loadReservations()
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条预约吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await reservationsAPI.delete(id)
    ElMessage.success('删除成功')
    loadReservations()
  } catch {
  }
}

onMounted(() => {
  loadReservations()
  loadPets()
  loadPackages()
})
</script>
