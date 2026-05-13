<template>
  <div>
    <el-card>
      <template #header>
        <span style="font-weight: bold">申领记录</span>
      </template>

      <el-form :inline="true">
        <el-form-item label="物品">
          <el-select v-model="searchForm.itemId" placeholder="请选择物品" clearable style="width: 200px">
            <el-option v-for="item in itemList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="员工">
          <el-select v-model="searchForm.employeeId" placeholder="请选择员工" clearable style="width: 200px">
            <el-option v-for="emp in employeeList" :key="emp.id" :label="emp.name" :value="emp.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="申领时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="itemName" label="物品名称" width="150" />
        <el-table-column prop="employeeName" label="申领人" width="120" />
        <el-table-column prop="employeeNo" label="员工编号" width="150" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column label="申领数量" width="120">
          <template #default="{ row }">
            {{ row.quantity }} {{ row.itemUnit }}
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="用途" />
        <el-table-column prop="requisitionTime" label="申领时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.requisitionTime) }}
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { itemApi, employeeApi, requisitionApi } from '../api'
import dayjs from 'dayjs'

const tableData = ref([])
const itemList = ref([])
const employeeList = ref([])

const searchForm = ref({
  itemId: null,
  employeeId: null,
  dateRange: []
})

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadItemList = async () => {
  const res = await itemApi.page({ page: 1, size: 1000 })
  itemList.value = res.data.records || []
}

const loadEmployeeList = async () => {
  const res = await employeeApi.list()
  employeeList.value = res.data || []
}

const loadData = async () => {
  const params = {
    page: pagination.value.page,
    size: pagination.value.size,
    itemId: searchForm.value.itemId,
    employeeId: searchForm.value.employeeId
  }
  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    params.startDate = searchForm.value.dateRange[0]
    params.endDate = searchForm.value.dateRange[1]
  }
  const res = await requisitionApi.page(params)
  tableData.value = res.data.records || []
  pagination.value.total = res.data.total || 0
}

const handleSearch = () => {
  pagination.value.page = 1
  loadData()
}

const resetSearch = () => {
  searchForm.value.itemId = null
  searchForm.value.employeeId = null
  searchForm.value.dateRange = []
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

onMounted(() => {
  loadItemList()
  loadEmployeeList()
  loadData()
})
</script>
