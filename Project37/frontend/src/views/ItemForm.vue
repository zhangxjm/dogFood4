<template>
  <div class="item-form-page">
    <h2>{{ isEdit ? '编辑物品' : '发布新物品' }}</h2>
    
    <div class="form-card">
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">保存成功！</div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">物品标题 *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="请输入物品标题"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">物品描述 *</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="请详细描述物品情况"
            required
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="price">价格 (¥) *</label>
            <input
              id="price"
              v-model.number="formData.price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </div>

          <div class="form-group">
            <label for="category">物品分类 *</label>
            <select id="category" v-model="formData.category_id" required>
              <option value="">请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="seller_name">卖家姓名 *</label>
            <input
              id="seller_name"
              v-model="formData.seller_name"
              type="text"
              placeholder="请输入您的姓名"
              required
            />
          </div>

          <div class="form-group">
            <label for="contact">联系方式 *</label>
            <input
              id="contact"
              v-model="formData.contact"
              type="text"
              placeholder="请输入手机号或QQ/微信"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="image_url">图片链接 (可选)</label>
          <input
            id="image_url"
            v-model="formData.image_url"
            type="url"
            placeholder="请输入图片URL地址"
          />
          <small class="form-hint">可以使用图床等服务的图片链接</small>
        </div>

        <div v-if="formData.image_url" class="image-preview">
          <h4>图片预览</h4>
          <img :src="formData.image_url" alt="预览" />
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$router.back()">
            取消
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '保存中...' : (isEdit ? '更新物品' : '发布物品') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategories, getItem, createItem, updateItem } from '../api'

const route = useRoute()
const router = useRouter()

const isEdit = route.name === 'EditItem'
const categories = ref([])
const submitting = ref(false)
const error = ref(null)
const success = ref(false)

const formData = ref({
  title: '',
  description: '',
  price: '',
  category_id: '',
  seller_name: '',
  contact: '',
  image_url: ''
})

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data
  } catch (err) {
    console.error('加载分类失败:', err)
  }
}

const loadItem = async () => {
  if (!isEdit) return
  
  try {
    const res = await getItem(route.params.id)
    const item = res.data
    formData.value = {
      title: item.title,
      description: item.description,
      price: item.price,
      category_id: item.category_id,
      seller_name: item.seller_name,
      contact: item.contact,
      image_url: item.image_url || ''
    }
  } catch (err) {
    console.error('加载物品失败:', err)
    error.value = '加载物品失败，请刷新页面重试'
  }
}

const handleSubmit = async () => {
  if (!formData.value.category_id) {
    error.value = '请选择物品分类'
    return
  }
  
  submitting.value = true
  error.value = null
  success.value = false
  
  try {
    if (isEdit) {
      await updateItem(route.params.id, formData.value)
      success.value = true
      setTimeout(() => {
        router.push(`/item/${route.params.id}`)
      }, 1000)
    } else {
      const res = await createItem(formData.value)
      success.value = true
      setTimeout(() => {
        router.push(`/item/${res.data.id}`)
      }, 1000)
    }
  } catch (err) {
    console.error('保存物品失败:', err)
    error.value = err.response?.data?.error || '保存失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadItem()
})
</script>

<style scoped>
.item-form-page {
  max-width: 800px;
  margin: 0 auto;
}

.item-form-page h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-hint {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: #888;
}

.image-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.image-preview h4 {
  margin-bottom: 0.5rem;
  color: #555;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.form-actions .btn {
  padding: 0.8rem 2rem;
  font-size: 1.05rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .form-card {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .btn {
    width: 100%;
  }
}
</style>
