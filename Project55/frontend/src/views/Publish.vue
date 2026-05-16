<template>
  <div class="page-container">
    <van-nav-bar title="发布商品" />
    
    <van-form @submit="onSubmit">
      <van-field
        v-model="form.title"
        label="标题"
        placeholder="请输入商品标题"
        :rules="[{ required: true, message: '请填写标题' }]"
      />
      
      <van-field
        v-model="form.price"
        label="价格"
        type="number"
        placeholder="请输入价格"
        :rules="[{ required: true, message: '请填写价格' }]"
      />
      
      <van-field
        v-model="form.category"
        label="分类"
        placeholder="请选择分类"
        is-link
        readonly
        :rules="[{ required: true, message: '请选择分类' }]"
        @click="showCategoryPicker = true"
      />
      
      <van-field
        v-model="form.description"
        label="描述"
        type="textarea"
        placeholder="请输入商品描述"
        rows="4"
      />

      <div style="padding: 12px 16px;">
        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">商品图片</div>
        <van-uploader
          v-model="fileList"
          multiple
          :max-count="9"
          :after-read="afterRead"
          :deletable="true"
        />
      </div>

      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          发布
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showCategoryPicker" position="bottom">
      <van-picker
        :columns="categories"
        @confirm="onConfirmCategory"
        @cancel="showCategoryPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { productApi } from '../api'

const router = useRouter()
const form = ref({
  title: '',
  price: '',
  category: '',
  description: ''
})
const fileList = ref([])
const showCategoryPicker = ref(false)
const categories = [
  { text: '数码', value: '数码' },
  { text: '服饰', value: '服饰' },
  { text: '图书', value: '图书' },
  { text: '家居', value: '家居' },
  { text: '其他', value: '其他' }
]

const user = JSON.parse(localStorage.getItem('user') || '{}')

const onConfirmCategory = ({ selectedOptions }) => {
  form.value.category = selectedOptions[0].value
  showCategoryPicker.value = false
}

const afterRead = async (file) => {
  file.status = 'uploading'
  file.message = '上传中...'
  
  try {
    const files = Array.isArray(file) ? file : [file]
    const actualFiles = files.map(f => f.file)
    const res = await productApi.uploadImages(actualFiles)
    if (res.data.success) {
      file.status = 'done'
      file.message = ''
    } else {
      file.status = 'failed'
      file.message = '上传失败'
    }
  } catch (e) {
    file.status = 'failed'
    file.message = '上传失败'
  }
}

const onSubmit = async () => {
  if (!user.id) {
    router.push('/login')
    return
  }
  if (fileList.value.length === 0) {
    showToast('请至少上传一张图片')
    return
  }
  
  const images = fileList.value.map(f => f.content).filter(url => url)
  
  try {
    const productData = {
      ...form.value,
      price: parseFloat(form.value.price),
      sellerId: user.id,
      sellerName: user.nickname || user.username,
      images: images,
      status: 'ON_SALE'
    }
    const res = await productApi.create(productData)
    if (res.data.success) {
      showToast('发布成功')
      setTimeout(() => {
        router.push('/seller')
      }, 1000)
    } else {
      showToast('发布失败')
    }
  } catch (e) {
    showToast('发布失败')
  }
}
</script>
