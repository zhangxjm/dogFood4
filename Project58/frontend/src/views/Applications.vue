<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>申领管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增申领
          </el-button>
        </div>
      </template>

      <el-table :data="applications" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="申领标题" />
        <el-table-column prop="user_name" label="申领人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="success" @click="handleReceive(row)" v-if="row.status === 2">收货</el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-if="row.status === 0">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isView ? '申领详情' : '新增申领'" width="700px">
      <el-form v-if="!isView" ref="formRef" :model="form" label-width="100px">
        <el-form-item label="申领标题">
          <el-input v-model="form.title" placeholder="请输入申领标题" />
        </el-form-item>
        <el-form-item label="申领物品">
          <div style="margin-bottom: 10px">
            <el-button type="primary" size="small" @click="addItem">添加物品</el-button>
          </div>
          <el-table :data="form.items" border size="small">
            <el-table-column label="物品名称">
              <template #default="{ row, $index }">
                <el-select v-model="row.supply_id" placeholder="请选择" style="width: 100%" @change="handleSupplyChange($index)">
                  <el-option v-for="s in supplies" :key="s.id" :label="s.name" :value="s.id" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="当前库存" width="100">
              <template #default="{ row }">
                {{ getSupplyStock(row.supply_id) }}
              </template>
            </el-table-column>
            <el-table-column label="申领数量" width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.quantity" :min="1" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="removeItem($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <div v-if="isView">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申领标题">{{ currentApplication.title }}</el-descriptions-item>
          <el-descriptions-item label="申领人">{{ currentApplication.user_name }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentApplication.status)">{{ getStatusText(currentApplication.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentApplication.created_at }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentApplication.remark }}</el-descriptions-item>
        </el-descriptions>
        <h4 style="margin-top: 20px; margin-bottom: 10px">申领物品：</h4>
        <el-table :data="currentApplication.items" border size="small">
          <el-table-column prop="supply_name" label="物品名称" />
          <el-table-column prop="quantity" label="申领数量" width="120" />
          <el-table-column prop="unit" label="单位" width="80" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button v-if="!isView" type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const applications = ref([])
const supplies = ref([])
const dialogVisible = ref(false)
const isView = ref(false)
const loading = ref(false)
const formRef = ref(null)
const currentApplication = ref({})
const form = ref({
  title: '',
  items: [],
  remark: ''
})

const statusMap = {
  0: { text: '待审批', type: 'warning' },
  1: { text: '一级通过', type: 'primary' },
  2: { text: '二级通过', type: 'success' },
  3: { text: '已驳回', type: 'danger' },
  4: { text: '已收货', type: 'info' }
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'info'

const loadApplications = async () => {
  try {
    const res = await request.get('/applications')
    applications.value = res.data.data
  } catch (error) {
    console.error('加载申领失败:', error)
  }
}

const loadSupplies = async () => {
  try {
    const res = await request.get('/supplies')
    supplies.value = res.data.data
  } catch (error) {
    console.error('加载物品失败:', error)
  }
}

const addItem = () => {
  form.value.items.push({
    supply_id: '',
    quantity: 1
  })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const getSupplyStock = (supplyId) => {
  const supply = supplies.value.find(s => s.id === supplyId)
  return supply ? supply.stock : 0
}

const handleSupplyChange = (index) => {
}

const handleAdd = () => {
  isView.value = false
  form.value = { title: '', items: [{ supply_id: '', quantity: 1 }], remark: '' }
  dialogVisible.value = true
}

const handleView = async (row) => {
  try {
    const res = await request.get(`/applications/${row.id}`)
    currentApplication.value = res.data.data
    isView.value = true
    dialogVisible.value = true
  } catch (error) {
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除申领「${row.title}」吗？`, '提示', {
      type: 'warning'
    })
    await request.delete(`/applications/${row.id}`)
    ElMessage.success('删除成功')
    loadApplications()
  } catch (error) {
  }
}

const handleReceive = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要收货「${row.title}」吗？`, '提示', {
      type: 'warning'
    })
    await request.post(`/applications/${row.id}/receive`)
    ElMessage.success('收货成功')
    loadApplications()
  } catch (error) {
  }
}

const handleSubmit = async () => {
  if (!form.value.title) {
    ElMessage.warning('请输入申领标题')
    return
  }
  if (!form.value.items.length) {
    ElMessage.warning('请添加申领物品')
    return
  }
  for (const item of form.value.items) {
    if (!item.supply_id) {
      ElMessage.warning('请选择所有申领物品')
      return
    }
  }

  loading.value = true
  try {
    await request.post('/applications', form.value)
    ElMessage.success('提交成功')
    dialogVisible.value = false
    loadApplications()
  } catch (error) {
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadApplications()
  loadSupplies()
})
</script>
