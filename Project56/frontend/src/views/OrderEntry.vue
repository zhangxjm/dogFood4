<template>
  <div class="order-entry">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>📝 新建订单</span>
        </div>
      </template>
      <el-form :model="orderForm" label-width="100px" ref="formRef">
        <el-form-item label="顾客姓名" prop="customerName">
          <el-input v-model="orderForm.customerName" placeholder="请输入顾客姓名" />
        </el-form-item>
        <el-form-item label="点餐内容" prop="items">
          <el-select
            v-model="selectedItems"
            multiple
            placeholder="请选择菜品"
            style="width: 100%"
            value-key="name"
            @change="updateItems"
          >
            <el-option
              v-for="item in menuItems"
              :key="item.name"
              :label="`${item.name} - ¥${item.price}`"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input-number
            v-model="orderForm.totalAmount"
            :min="0"
            :precision="2"
            style="width: 200px"
          />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitOrder" :loading="submitting">
            提交订单
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="quick-menu-card" style="margin-top: 20px">
      <template #header>
        <span>🏪 快捷菜单</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in menuItems" :key="item.name">
          <el-button
            type="primary"
            plain
            style="width: 100%; margin-bottom: 10px; height: auto; padding: 10px"
            @click="quickAddItem(item)"
          >
            <div>{{ item.name }}</div>
            <div style="font-size: 12px; color: #909399">¥{{ item.price }}</div>
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import orderApi from '../api/orders'

const formRef = ref(null)
const submitting = ref(false)

const menuItems = ref([
  { name: '宫保鸡丁', price: 28 },
  { name: '鱼香肉丝', price: 26 },
  { name: '红烧肉', price: 38 },
  { name: '清炒时蔬', price: 18 },
  { name: '麻婆豆腐', price: 22 },
  { name: '糖醋里脊', price: 32 },
  { name: '米饭', price: 2 },
  { name: '可乐', price: 5 }
])

const selectedItems = ref([])

const orderForm = reactive({
  customerName: '',
  items: '',
  totalAmount: 0
})

const updateItems = () => {
  const itemNames = selectedItems.value.map(item => item.name)
  orderForm.items = itemNames.join(', ')
  orderForm.totalAmount = selectedItems.value.reduce((sum, item) => sum + item.price, 0)
}

const quickAddItem = (item) => {
  const existing = selectedItems.value.find(i => i.name === item.name)
  if (!existing) {
    selectedItems.value.push(item)
    updateItems()
  }
}

const submitOrder = async () => {
  if (!orderForm.customerName) {
    ElMessage.warning('请输入顾客姓名')
    return
  }
  if (!orderForm.items) {
    ElMessage.warning('请选择菜品')
    return
  }

  submitting.value = true
  try {
    await orderApi.createOrder({
      customer_name: orderForm.customerName,
      items: orderForm.items,
      total_amount: orderForm.totalAmount
    })
    ElMessage.success('订单创建成功！')
    resetForm()
  } catch (error) {
    ElMessage.error('订单创建失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  orderForm.customerName = ''
  orderForm.items = ''
  orderForm.totalAmount = 0
  selectedItems.value = []
}
</script>

<style scoped>
.order-entry {
  max-width: 800px;
  margin: 0 auto;
}

.form-card, .quick-menu-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
