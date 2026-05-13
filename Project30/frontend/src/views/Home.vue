<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <el-icon size="40" color="#409EFF"><Box /></el-icon>
            <div style="font-size: 14px; color: #606266; margin-top: 10px">物品分类</div>
            <div style="font-size: 28px; font-weight: bold; color: #303133; margin-top: 10px">{{ stats.categoryCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <el-icon size="40" color="#67C23A"><Goods /></el-icon>
            <div style="font-size: 14px; color: #606266; margin-top: 10px">物品总数</div>
            <div style="font-size: 28px; font-weight: bold; color: #303133; margin-top: 10px">{{ stats.itemCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <el-icon size="40" color="#E6A23C"><User /></el-icon>
            <div style="font-size: 14px; color: #606266; margin-top: 10px">员工数量</div>
            <div style="font-size: 28px; font-weight: bold; color: #303133; margin-top: 10px">{{ stats.employeeCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <el-icon size="40" color="#F56C6C"><Document /></el-icon>
            <div style="font-size: 14px; color: #606266; margin-top: 10px">申领记录</div>
            <div style="font-size: 28px; font-weight: bold; color: #303133; margin-top: 10px">{{ stats.requisitionCount }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <span style="font-weight: bold">欢迎使用办公用品申领系统</span>
      </template>
      <div style="color: #606266; line-height: 2">
        <p>本系统用于公司办公用品的库存管理和申领登记。</p>
        <p>主要功能包括：</p>
        <ul style="margin-left: 20px">
          <li><strong>物品分类管理</strong>：管理物品的分类信息</li>
          <li><strong>物品库存管理</strong>：登记物品的库存信息，包括名称、数量、单位、存放位置等</li>
          <li><strong>员工管理</strong>：管理员工信息，用于申领登记</li>
          <li><strong>物品申领</strong>：员工申领办公用品，直接登记，无需审批</li>
          <li><strong>申领记录</strong>：查询历史申领记录，支持按物品、员工、时间范围筛选</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoryApi, itemApi, employeeApi, requisitionApi } from '../api'

const stats = ref({
  categoryCount: 0,
  itemCount: 0,
  employeeCount: 0,
  requisitionCount: 0
})

onMounted(async () => {
  const [catRes, itemRes, empRes, reqRes] = await Promise.all([
    categoryApi.page({ page: 1, size: 1 }),
    itemApi.page({ page: 1, size: 1 }),
    employeeApi.page({ page: 1, size: 1 }),
    requisitionApi.page({ page: 1, size: 1 })
  ])
  stats.value.categoryCount = catRes.data.total || 0
  stats.value.itemCount = itemRes.data.total || 0
  stats.value.employeeCount = empRes.data.total || 0
  stats.value.requisitionCount = reqRes.data.total || 0
})
</script>
