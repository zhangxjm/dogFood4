<template>
  <div class="inventory">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF">
              <el-icon><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total_products || 0 }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total_stock || 0 }}</div>
              <div class="stat-label">库存总量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #E6A23C">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.low_stock_count || 0 }}</div>
              <div class="stat-label">低库存商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #F56C6C">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatMoney(stats.total_value || 0) }}</div>
              <div class="stat-label">库存总价值</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <div class="search-form">
            <el-input v-model="searchForm.keyword" placeholder="搜索商品名称/SKU" clearable style="width: 250px" @keyup.enter="fetchData" />
            <el-select v-model="searchForm.category" placeholder="选择分类" clearable style="width: 180px">
              <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
            </el-select>
            <el-switch
              v-model="searchForm.low_stock"
              active-text="仅显示低库存"
              @change="fetchData"
            />
            <el-button type="primary" @click="fetchData">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="sku" label="SKU" width="120" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="price" label="单价(¥)" width="120">
          <template #default="scope">
            {{ Number(scope.row.price).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="当前库存" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.is_low_stock ? 'danger' : 'success'" size="small">
              {{ scope.row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="min_stock" label="最低库存" width="100" />
        <el-table-column label="库存状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_low_stock ? 'danger' : 'success'" size="small">
              {{ scope.row.is_low_stock ? '低库存' : '正常' }}
            </el-tag>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getInventoryList, getInventoryStatistics } from '@/api/inventory'
import { getProductCategories } from '@/api/product'

const tableData = ref([])
const stats = ref({})
const categories = ref([])
const loading = ref(false)

const searchForm = reactive({
  keyword: '',
  category: '',
  low_stock: false
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const formatMoney = (value) => {
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      keyword: searchForm.keyword,
      category: searchForm.category,
      low_stock: searchForm.low_stock
    }
    const res = await getInventoryList(params)
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    stats.value = await getInventoryStatistics()
  } catch (error) {
    console.error(error)
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await getProductCategories()
  } catch (error) {
    console.error(error)
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.low_stock = false
  pagination.page = 1
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchStats()
  fetchCategories()
})
</script>

<style scoped>
.inventory {
  padding: 0;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
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
