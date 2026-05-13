<template>
  <div class="product-edit-page">
    <van-nav-bar title="编辑商品" left-arrow @click-left="router.back()" />
    
    <van-loading v-if="loading" class="loading" />
    
    <template v-else>
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
              <span>
                {{ form.status === 'up' ? '上架' : form.status === 'down' ? '下架' : '请选择' }}
              </span>
            </template>
          </van-field>
        </van-cell-group>
        
        <div style="margin: 16px">
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            保存修改
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
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast } from 'vant'
import { getProductDetail, updateProduct } from '@/api/products'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const showStatusPicker = ref(false)

const form = ref({
  name: '',
  original_price: '',
  group_price: '',
  stock: '',
  description: '',
  status: 'up'
})

const statusOptions = [
  { text: '上架', value: 'up' },
  { text: '下架', value: 'down' }
]

function onStatusConfirm({ selectedOptions }) {
  form.value.status = selectedOptions[0].value
  showStatusPicker.value = false
}

async function fetchProduct() {
  loading.value = true
  try {
    const id = route.params.id
    const product = await getProductDetail(id)
    form.value = {
      name: product.name,
      original_price: product.original_price,
      group_price: product.group_price,
      stock: product.stock,
      description: product.description || '',
      status: product.status
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleSubmit(values) {
  submitting.value = true
  try {
    const id = route.params.id
    await updateProduct(id, {
      name: values.name,
      original_price: parseFloat(values.original_price),
      group_price: parseFloat(values.group_price),
      stock: parseInt(values.stock),
      description: values.description,
      status: values.status
    })
    showSuccessToast('保存成功')
    router.back()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped lang="less">
.product-edit-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 40px 0;
}
</style>