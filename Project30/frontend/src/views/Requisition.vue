<template>
  <div>
    <el-card>
      <template #header>
        <span style="font-weight: bold">物品申领</span>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" style="max-width: 600px">
        <el-form-item label="选择物品" prop="itemId">
          <el-select v-model="form.itemId" placeholder="请选择物品" style="width: 100%" @change="handleItemChange">
            <el-option v-for="item in itemList" :key="item.id" :label="`${item.name}（库存：${item.quantity}${item.unit}）`" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="当前库存">
          <el-tag :type="currentItem.quantity <= currentItem.minQuantity ? 'danger' : 'success'">
            {{ currentItem.quantity || 0 }} {{ currentItem.unit || '' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="申领员工" prop="employeeId">
          <el-select v-model="form.employeeId" placeholder="请选择员工" style="width: 100%">
            <el-option v-for="emp in employeeList" :key="emp.id" :label="`${emp.name}（${emp.employeeNo}）`" :value="emp.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="申领数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" :max="currentItem.quantity || 9999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="申领用途">
          <el-input v-model="form.purpose" type="textarea" :rows="3" placeholder="请输入申领用途（可选）" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            <el-icon><Tickets /></el-icon>
            确认申领
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { itemApi, employeeApi, requisitionApi } from '../api'

const formRef = ref(null)
const loading = ref(false)
const itemList = ref([])
const employeeList = ref([])
const currentItem = reactive({ quantity: 0, unit: '', minQuantity: 0 })

const form = ref({
  itemId: null,
  employeeId: null,
  quantity: 1,
  purpose: ''
})

const rules = {
  itemId: [{ required: true, message: '请选择物品', trigger: 'change' }],
  employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入申领数量', trigger: 'blur' }]
}

const loadItemList = async () => {
  const res = await itemApi.page({ page: 1, size: 1000 })
  itemList.value = res.data.records || []
}

const loadEmployeeList = async () => {
  const res = await employeeApi.list()
  employeeList.value = res.data || []
}

const handleItemChange = (itemId) => {
  const item = itemList.value.find(i => i.id === itemId)
  if (item) {
    currentItem.quantity = item.quantity
    currentItem.unit = item.unit
    currentItem.minQuantity = item.minQuantity
    if (form.value.quantity > item.quantity) {
      form.value.quantity = Math.max(1, item.quantity)
    }
  } else {
    currentItem.quantity = 0
    currentItem.unit = ''
    currentItem.minQuantity = 0
  }
}

const handleSubmit = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    await requisitionApi.create(form.value)
    ElMessage.success('申领成功')
    resetForm()
    await loadItemList()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = { itemId: null, employeeId: null, quantity: 1, purpose: '' }
  currentItem.quantity = 0
  currentItem.unit = ''
  currentItem.minQuantity = 0
  formRef.value?.resetFields()
}

onMounted(() => {
  loadItemList()
  loadEmployeeList()
})
</script>
