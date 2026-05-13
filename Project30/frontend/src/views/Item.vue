<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: bold">物品库存列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增物品
          </el-button>
        </div>
      </template>

      <el-form :inline="true">
        <el-form-item label="物品名称">
          <el-input v-model="searchForm.name" placeholder="请输入物品名称" clearable />
        </el-form-item>
        <el-form-item label="物品分类">
          <el-select v-model="searchForm.categoryId" placeholder="请选择分类" clearable style="width: 150px">
            <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="物品名称" />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="quantity" label="库存数量" width="100">
          <template #default="{ row }">
            <el-tag :type="row.quantity <= row.minQuantity ? 'danger' : 'success'">
              {{ row.quantity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="minQuantity" label="最低预警" width="100" />
        <el-table-column prop="location" label="存放位置" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end"
        :current-page="pagination.page"
        :page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="物品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入物品名称" />
        </el-form-item>
        <el-form-item label="物品分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位，如：个、支、包" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存数量" prop="quantity">
              <el-input-number v-model="form.quantity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最低预警" prop="minQuantity">
              <el-input-number v-model="form.minQuantity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="存放位置">
          <el-input v-model="form.location" placeholder="请输入存放位置" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
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
import { itemApi, categoryApi } from '../api'

const tableData = ref([])
const categoryList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增物品')
const formRef = ref(null)
const isEdit = ref(false)

const searchForm = ref({
  name: '',
  categoryId: null
})

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const form = ref({
  id: null,
  name: '',
  categoryId: null,
  unit: '个',
  quantity: 0,
  minQuantity: 0,
  location: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }]
}

const loadCategoryList = async () => {
  const res = await categoryApi.list()
  categoryList.value = res.data || []
}

const loadData = async () => {
  const params = {
    page: pagination.value.page,
    size: pagination.value.size,
    name: searchForm.value.name
  }
  if (searchForm.value.categoryId) {
    params.categoryId = searchForm.value.categoryId
  }
  const res = await itemApi.page(params)
  tableData.value = res.data.records || []
  pagination.value.total = res.data.total || 0
}

const handleSearch = () => {
  pagination.value.page = 1
  loadData()
}

const resetSearch = () => {
  searchForm.value.name = ''
  searchForm.value.categoryId = null
  handleSearch()
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.value.page = page
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增物品'
  form.value = {
    id: null,
    name: '',
    categoryId: null,
    unit: '个',
    quantity: 0,
    minQuantity: 0,
    location: '',
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑物品'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该物品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await itemApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const handleSubmit = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await itemApi.update(form.value)
    ElMessage.success('更新成功')
  } else {
    await itemApi.add(form.value)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

onMounted(() => {
  loadCategoryList()
  loadData()
})
</script>
