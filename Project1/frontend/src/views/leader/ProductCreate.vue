<template>
  <div class="product-create-page">
    <van-nav-bar title="发布商品" left-arrow @click-left="router.back()" />
    
    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          name="name"
          label="商品名称"
          placeholder="请输入商品名称"
          :rules="[{ required: true, message: '请输入商品名称' }]"
        />
        <van-field
          v-model="form.original_price"
          type="digit"
          name="original_price"
          label="原价"
          placeholder="请输入原价"
          :rules="[{ required: true, message: '请输入原价' }]"
        />
        <van-field
          v-model="form.group_price"
          type="digit"
          name="group_price"
          label="团购价"
          placeholder="请输入团购价"
          :rules="[{ required: true, message: '请输入团购价' }]"
        />
        <van-field
          v-model="form.stock"
          type="number"
          name="stock"
          label="库存"
          placeholder="请输入库存数量"
          :rules="[{ required: true, message: '请输入库存' }]"
        />
        <van-field
          v-model="form.description"
          type="textarea"
          name="description"
          label="商品描述"
          placeholder="请输入商品描述"
          :autosize="{ minRows: 3 }"
        />
        <van-field
          v-model="form.status"
          name="status"
          label="商品状态"
          is-link
          readonly
          @click="showStatusPicker = true"
        >
          <template #input>
            <span :class="{ placeholder: !form.status }">
              {{ form.status === 'up' ? '上架' : form.status === 'down' ? '下架' : '请选择' }}
            </span>
          </template>
        </van-field>
      </van-cell-group>
      
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          发布商品
        </van-button>
      </div>
    </van-form>
    
    <van-popup v-model:show="showStatusPicker" position="bottom" round>
      <van-picker
        title="选择状态"
        :columns="statusOptions"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import { createProduct } from '@/api/products'

const router = useRouter()

const form = ref({
  name: '',
  original_price: '',
  group_price: '',
  stock: '',
  description: '',
  status: 'up'
})
const loading = ref(false)
const showStatusPicker = ref(false)

const statusOptions = [
  { text: '上架', value: 'up' },
  { text: '下架', value: 'down' }
]

function onStatusConfirm({ selectedOptions }) {
  form.value.status = selectedOptions[0].value
  showStatusPicker.value = false
}

async function handleSubmit(values) {
  loading.value = true
  try {
    await createProduct({
      name: values.name,
      original_price: parseFloat(values.original_price),
      group_price: parseFloat(values.group_price),
      stock: parseInt(values.stock),
      description: values.description,
      status: values.status
    })
    showSuccessToast('发布成功')
    router.replace('/leader/products')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.product-create-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.placeholder {
  color: #c8c9cc;
}
</style>