<template>
  <div class="records">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="search-form">
            <el-input v-model="searchForm.keyword" placeholder="搜索SKU/商品名称" clearable style="width: 250px" @keyup.enter="fetchData" />
            <el-select v-model="searchForm.type" placeholder="全部类型" clearable style="width: 150px" @change="fetchData">
              <el-option label="入库" value="inbound" />
              <el-option label="出库" value="outbound" />
            </el-select>
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
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'inbound' ? 'success' : 'danger'" size="small">
              {{ scope.row.type === 'inbound' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="product_sku" label="SKU" width="120" />
        <el-table-column prop="product_name" label="商品名称" />
        <el-table-column prop="quantity" label="数量" width="100">
          <template #default="scope">
            <span :style="{ color: scope.row.type === 'inbound' ? '#67C23A' : '#F56C6C', fontWeight: 'bold' }">
              {{ scope.row.type === 'inbound' ? '+' : '-' }}{{ scope.row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="供应商/客户" width="150">
          <template #default="scope">
            {{ scope.row.type === 'inbound' ? scope.row.supplier : scope.row.customer }}
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="tableData.length === 0 && !loading" description="暂无记录" />

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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAllRecords } from '@/api/inventory'

const tableData = ref([])
const loading = ref(false)

const searchForm = reactive({
  keyword: '',
  type: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

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
      keyword: searchForm.keyword,
      type: searchForm.type
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.start_date = searchForm.dateRange[0]
      params.end_date = searchForm.dateRange[1]
    }
    const res = await getAllRecords(params)
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.type = ''
  searchForm.dateRange = []
  pagination.page = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.records {
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
  align-items: center;
}
</style>
