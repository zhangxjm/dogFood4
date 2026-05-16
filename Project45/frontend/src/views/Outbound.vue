<template>
  <div class="outbound">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="search-form">
            <el-input v-model="searchForm.keyword" placeholder="搜索SKU/商品/客户" clearable style="width: 250px" @keyup.enter="fetchData" />
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 300px"
            />
            <el-button type="primary" @click="fetchData">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增出库
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="product_sku" label="SKU" width="120" />
        <el-table-column prop="product_name" label="商品名称" />
        <el-table-column prop="quantity" label="数量" width="100">
          <template #default="scope">
            <el-tag type="danger" size="small">-{{ scope.row.quantity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="新增出库"
      width="500px"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品" prop="product_id">
          <el-select v-model="form.product_id" placeholder="请选择商品" filterable style="width: 100%" @change="onProductChange">
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="`${product.name} (SKU: ${product.sku}) - 库存: ${product.stock}`"
              :value="product.id"
              :disabled="product.stock === 0"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" :max="maxQuantity" style="width: 100%" />
          <span v-if="selectedProduct" style="color: #909399; font-size: 12px">
            当前库存: {{ selectedProduct.stock }}
          </span>
        </el-form-item>
        <el-form-item label="客户" prop="customer">
          <el-input v-model="form.customer" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="form.operator" placeholder="请输入操作人" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOutboundRecords, createOutbound, deleteOutbound } from '@/api/outbound'
import { getProducts } from '@/api/product'

const tableData = ref([])
const products = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)

const searchForm = reactive({
  keyword: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const formRef = ref(null)

const form = reactive({
  product_id: null,
  quantity: 1,
  customer: '',
  operator: '',
  remark: ''
})

const selectedProduct = computed(() => {
  return products.value.find(p => p.id === form.product_id)
})

const maxQuantity = computed(() => {
  return selectedProduct.value?.stock || 999999
})

const rules = {
  product_id: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  customer: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }]
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      keyword: searchForm.keyword
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.start_date = searchForm.dateRange[0]
      params.end_date = searchForm.dateRange[1]
    }
    const res = await getOutboundRecords(params)
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchProducts = async () => {
  try {
    const res = await getProducts({ page: 1, page_size: 1000 })
    products.value = res.list || []
  } catch (error) {
    console.error(error)
  }
}

const onProductChange = () => {
  const product = products.value.find(p => p.id === form.product_id)
  if (product) {
    form.quantity = Math.min(1, product.stock)
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.dateRange = []
  pagination.page = 1
  fetchData()
}

const handleAdd = () => {
  Object.assign(form, {
    product_id: null,
    quantity: 1,
    customer: '',
    operator: '',
    remark: ''
  })
  fetchProducts()
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条出库记录吗？删除后库存将回滚。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOutbound(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const closeDialog = () => {
  formRef.value?.resetFields()
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    await createOutbound(form)
    ElMessage.success('出库成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.outbound {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  display: flex;
  gap: 10px;
}
</style>
