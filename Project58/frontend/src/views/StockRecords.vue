<template>
  <div>
    <el-card>
      <template #header>
        <span>库存记录</span>
      </template>

      <el-table :data="records" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="supply_name" label="物品名称" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'success' : 'danger'">{{ row.type === 1 ? '入库' : '出库' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="stock_before" label="变动前库存" width="120" />
        <el-table-column prop="stock_after" label="变动后库存" width="120" />
        <el-table-column prop="user_name" label="操作人" width="100" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const records = ref([])

const loadRecords = async () => {
  try {
    const res = await request.get('/stock-records')
    records.value = res.data.data
  } catch (error) {
    console.error('加载库存记录失败:', error)
  }
}

onMounted(() => {
  loadRecords()
})
</script>
