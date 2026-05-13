<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.keyword" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon> 查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd"><el-icon><Plus /></el-icon> 新增采购订单</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="totalAmount" label="总金额" width="120" />
        <el-table-column prop="paidAmount" label="已付金额" width="120" />
        <el-table-column prop="unpaidAmount" label="未付金额" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="statusType[scope.row.status]">{{ statusMap[scope.row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleDetail(scope.row)">详情</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" title="采购订单详情" width="900px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号">{{ form.orderNo }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商">{{ form.supplierName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总金额">{{ form.totalAmount }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-tag :type="statusType[form.status]">{{ statusMap[form.status] }}</el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">订单明细</el-divider>
        <el-table :data="orderDetails" border>
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="productCode" label="商品编码" width="120" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="price" label="单价" width="120" />
          <el-table-column prop="amount" label="金额" width="120" />
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const dialogVisible = ref(false)

const searchForm = reactive({ keyword: '' })

const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const tableData = ref([])
const orderDetails = ref([])
const form = reactive({})

const statusMap = { 0: '草稿', 1: '已审核', 2: '已入库', 3: '已完成' }
const statusType = { 0: 'info', 1: 'warning', 2: 'primary', 3: 'success' }

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.post('/purchase/page', { ...pagination, keyword: searchForm.keyword })
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.pageNum = 1; loadData() }
const handleReset = () => { searchForm.keyword = ''; handleSearch() }
const handleAdd = () => { ElMessage.info('请在实际使用中完善采购订单功能') }

const handleDetail = async (row) => {
  Object.assign(form, row)
  const res = await request.get(`/purchase/${row.id}/details`)
  orderDetails.value = res.data || []
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(async () => {
    await request.delete(`/purchase/${row.id}`)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

onMounted(() => { loadData() })
</script>

<style scoped>
.page-container { padding: 0; }
.search-card { margin-bottom: 20px; }
</style>