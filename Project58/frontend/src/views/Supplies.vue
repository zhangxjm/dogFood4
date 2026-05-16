<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>办公用品管理</span>
          <el-button type="primary" @click="handleAdd" v-if="userStore.user?.role >= 2">
            <el-icon><Plus /></el-icon>
            新增物品
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" style="margin-bottom: 20px">
        <el-form-item label="物品名称">
          <el-input v-model="queryForm.keyword" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="queryForm.category_id" placeholder="请选择分类" clearable style="width: 200px">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadSupplies">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="supplies" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="物品名称" />
        <el-table-column prop="category_name" label="分类" width="120" />
        <el-table-column prop="spec" label="规格" width="120" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            <el-tag :type="row.stock < row.min_stock ? 'danger' : 'success'">{{ row.stock }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="min_stock" label="最低库存" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right" v-if="userStore.user?.role >= 2">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="success" @click="handleStockIn(row)">入库</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑物品' : '新增物品'" width="600px">
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item label="物品名称">
          <el-input v-model="form.name" placeholder="请输入物品名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category_id" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="form.spec" placeholder="请输入规格" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="初始库存" v-if="!isEdit">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="最低库存">
          <el-input-number v-model="form.min_stock" :min="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="stockInVisible" title="入库" width="500px">
      <el-form :model="stockInForm" label-width="100px">
        <el-form-item label="物品名称">
          <el-input v-model="stockInForm.name" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input v-model="stockInForm.current_stock" disabled />
        </el-form-item>
        <el-form-item label="入库数量">
          <el-input-number v-model="stockInForm.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="stockInForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockInVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStockInSubmit" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const supplies = ref([])
const categories = ref([])
const dialogVisible = ref(false)
const stockInVisible = ref(false)
const isEdit = ref(false)
const loading = ref(false)
const formRef = ref(null)
const queryForm = ref({
  keyword: '',
  category_id: ''
})
const form = ref({
  name: '',
  category_id: '',
  spec: '',
  unit: '',
  stock: 0,
  min_stock: 10,
  description: ''
})
const stockInForm = ref({
  id: '',
  name: '',
  current_stock: 0,
  quantity: 1,
  remark: ''
})

const loadCategories = async () => {
  try {
    const res = await request.get('/categories')
    categories.value = res.data.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadSupplies = async () => {
  try {
    const params = { ...queryForm.value }
    if (!params.category_id) delete params.category_id
    const res = await request.get('/supplies', { params })
    supplies.value = res.data.data
  } catch (error) {
    console.error('加载物品失败:', error)
  }
}

const resetQuery = () => {
  queryForm.value = { keyword: '', category_id: '' }
  loadSupplies()
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { name: '', category_id: '', spec: '', unit: '', stock: 0, min_stock: 10, description: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除物品「${row.name}」吗？`, '提示', {
      type: 'warning'
    })
    await request.delete(`/supplies/${row.id}`)
    ElMessage.success('删除成功')
    loadSupplies()
  } catch (error) {
  }
}

const handleStockIn = (row) => {
  stockInForm.value = {
    id: row.id,
    name: row.name,
    current_stock: row.stock,
    quantity: 1,
    remark: ''
  }
  stockInVisible.value = true
}

const handleStockInSubmit = async () => {
  if (!stockInForm.value.quantity || stockInForm.value.quantity < 1) {
    ElMessage.warning('请输入正确的入库数量')
    return
  }

  loading.value = true
  try {
    await request.post(`/supplies/${stockInForm.value.id}/stock-in`, {
      quantity: stockInForm.value.quantity,
      remark: stockInForm.value.remark
    })
    ElMessage.success('入库成功')
    stockInVisible.value = false
    loadSupplies()
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入物品名称')
    return
  }
  if (!form.value.category_id) {
    ElMessage.warning('请选择分类')
    return
  }

  loading.value = true
  try {
    if (isEdit.value) {
      await request.put(`/supplies/${form.value.id}`, form.value)
      ElMessage.success('编辑成功')
    } else {
      await request.post('/supplies', form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadSupplies()
  } catch (error) {
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadSupplies()
})
</script>
