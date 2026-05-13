<template>
  <div class="dish-form-page">
    <van-nav-bar :title="isEdit ? '编辑菜品' : '添加菜品'" left-arrow @click-left="goBack" fixed>
      <template #right>
        <van-button type="primary" size="small" @click="onSubmit" :loading="submitting">保存</van-button>
      </template>
    </van-nav-bar>
    <div class="content" :style="{ paddingTop: '46px' }">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.name"
            name="name"
            label="菜品名称"
            placeholder="请输入菜品名称"
            :rules="[{ required: true, message: '请输入菜品名称' }]"
          />
          <van-field
            v-model="form.description"
            name="description"
            label="菜品描述"
            type="textarea"
            placeholder="请输入菜品描述（可选）"
            maxlength="500"
            rows="3"
          />
          <van-field
            v-model="form.price"
            name="price"
            label="价格"
            type="digit"
            placeholder="请输入价格"
            :rules="[{ required: true, message: '请输入价格' }]"
          >
            <template #left-icon>
              <span style="margin-right: 4px">¥</span>
            </template>
          </van-field>
          <van-field
            v-model="form.image"
            name="image"
            label="图片链接"
            placeholder="请输入图片URL（可选）"
          />
          <van-field
            v-model="categoryId"
            label="菜品分类"
            placeholder="请选择分类"
            readonly
            clickable
            @click="showCategoryPicker = true"
          >
            <template #right-icon>
              <van-icon name="arrow" />
            </template>
          </van-field>
          <van-cell title="上架销售">
            <template #right-icon>
              <van-switch v-model="form.is_available" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-form>

      <van-popup v-model:show="showCategoryPicker" position="bottom" round>
        <van-picker
          :columns="categoryColumns"
          title="选择分类"
          :show-toolbar="true"
          @confirm="onCategoryConfirm"
          @cancel="showCategoryPicker = false"
        />
      </van-popup>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { dishApi, categoryApi } from '@/api'

const router = useRouter()
const route = useRoute()
const submitting = ref(false)
const showCategoryPicker = ref(false)
const categories = ref([])
const categoryId = ref('')

const form = reactive({
  name: '',
  description: '',
  price: '',
  image: '',
  is_available: true,
  category_id: null
})

const isEdit = computed(() => !!route.params.id)

const categoryColumns = computed(() => {
  return categories.value.map(c => ({ text: c.name, value: c.id }))
})

const loadCategories = async () => {
  try {
    const res = await categoryApi.list()
    categories.value = res.data
    if (res.data.length > 0 && !form.category_id) {
      form.category_id = res.data[0].id
      categoryId.value = res.data[0].name
    }
  } catch (e) {
    showToast('加载分类失败')
  }
}

const loadDish = async () => {
  try {
    const res = await dishApi.get(route.params.id)
    const data = res.data
    form.name = data.name
    form.description = data.description
    form.price = String(data.price)
    form.image = data.image
    form.is_available = data.is_available
    form.category_id = data.category_id
    const cat = categories.value.find(c => c.id === data.category_id)
    if (cat) categoryId.value = cat.name
  } catch (e) {
    showToast('加载菜品失败')
    router.back()
  }
}

const onCategoryConfirm = ({ selectedOptions }) => {
  const option = selectedOptions[0]
  form.category_id = option.value
  categoryId.value = option.text
  showCategoryPicker.value = false
}

const goBack = () => {
  router.back()
}

const onSubmit = async () => {
  if (!form.name.trim()) {
    showToast('请输入菜品名称')
    return
  }
  if (!form.price || parseFloat(form.price) <= 0) {
    showToast('请输入有效价格')
    return
  }
  if (!form.category_id) {
    showToast('请选择分类')
    return
  }

  submitting.value = true
  try {
    const data = {
      ...form,
      price: parseFloat(form.price)
    }
    if (isEdit.value) {
      await dishApi.update(route.params.id, data)
      showToast('修改成功')
    } else {
      await dishApi.create(data)
      showToast('添加成功')
    }
    router.back()
  } catch (e) {
    showToast(isEdit.value ? '修改失败' : '添加失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCategories().then(() => {
    if (isEdit.value) {
      loadDish()
    }
  })
})
</script>

<style scoped>
.dish-form-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-bottom: 20px;
}
</style>
