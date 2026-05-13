<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="预警类型">
          <el-select v-model="searchForm.alertType" placeholder="全部" clearable style="width: 150px">
            <el-option label="库存不足" :value="1" />
            <el-option label="库存超量" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.processed" placeholder="全部" clearable style="width: 150px">
            <el-option label="未处理" :value="false" />
            <el-option label="已处理" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon> 查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header"><span>库存预警列表</span></div>
      </template>
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="productCode" label="商品编码" width="150" />
        <el-table-column prop="warehouseName" label="仓库名称" width="150" />
        <el-table-column prop="alertType" label="预警类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.alertType === 1 ? 'danger' : 'warning'">
              {{ scope.row.alertType === 1 ? '库存不足' : '库存超量' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentStock" label="当前库存" width="120" />
        <el-table-column prop="threshold" label="阈值" width="100" />
        <el-table-column prop="processed" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.processed ? 'success' : 'info'">
              {{ scope.row.processed ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="预警时间" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button v-if="!scope.row.processed" type="primary" link @click="handleProcess(scope.row)">标记已处理</el-button>
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
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const searchForm = reactive({ alertType: null, processed: null })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })
const tableData = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.post('/inventory-alert/page', { ...pagination, ...searchForm })
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; loadData() }
const handleReset = () => { searchForm.alertType = null; searchForm.processed = null; handleSearch() }
const handleProcess = async (row) => {
  await request.post(`/inventory-alert/${row.id}/process`)
  ElMessage.success('处理成功')
  loadData()
}

onMounted(() => { loadData() })
</script>

<style scoped>
.page-container { padding: 0; }
.search-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>