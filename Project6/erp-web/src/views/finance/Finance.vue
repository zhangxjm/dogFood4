<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词"><el-input v-model="searchForm.keyword" placeholder="凭证编号或摘要" clearable /></el-form-item>
        <el-form-item label="凭证类型">
          <el-select v-model="searchForm.voucherType" placeholder="全部" clearable style="width: 150px">
            <el-option label="收入" :value="1" />
            <el-option label="支出" :value="2" />
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
        <div class="card-header"><span>财务凭证列表</span></div>
      </template>
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="voucherNo" label="凭证编号" width="200" />
        <el-table-column prop="voucherDate" label="凭证日期" width="150" />
        <el-table-column prop="voucherType" label="凭证类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.voucherType === 1 ? 'success' : 'danger'">
              {{ scope.row.voucherType === 1 ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" />
        <el-table-column prop="summary" label="摘要" />
        <el-table-column prop="remark" label="备注" width="200" />
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
const searchForm = reactive({ keyword: '', voucherType: null })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })
const tableData = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.post('/finance/page', { ...pagination, ...searchForm })
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; loadData() }
const handleReset = () => { searchForm.keyword = ''; searchForm.voucherType = null; handleSearch() }

onMounted(() => { loadData() })
</script>

<style scoped>
.page-container { padding: 0; }
.search-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>