<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词"><el-input v-model="searchForm.keyword" placeholder="商品名称或编码" clearable /></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon> 查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header"><span>库存列表</span></div>
      </template>
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="productCode" label="商品编码" width="150" />
        <el-table-column prop="warehouseName" label="仓库名称" width="150" />
        <el-table-column prop="quantity" label="库存数量" width="120" />
        <el-table-column prop="availableQuantity" label="可用数量" width="120" />
        <el-table-column prop="minStock" label="最小库存" width="100" />
        <el-table-column prop="maxStock" label="最大库存" width="100" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.quantity < scope.row.minStock ? 'danger' : (scope.row.quantity > scope.row.maxStock ? 'warning' : 'success')">
              {{ scope.row.quantity < scope.row.minStock ? '库存不足' : (scope.row.quantity > scope.row.maxStock ? '库存超量' : '正常') }}
            </el-tag>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'

const loading = ref(false)
const searchForm = reactive({ keyword: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })
const tableData = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.post('/inventory/page', { ...pagination, keyword: searchForm.keyword })
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; loadData() }
const handleReset = () => { searchForm.keyword = ''; handleSearch() }

onMounted(() => { loadData() })
</script>

<style scoped>
.page-container { padding: 0; }
.search-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>