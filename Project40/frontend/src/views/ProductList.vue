<template>
  <div class="product-list">
    <div class="card">
      <div class="card-header">
        <h2>商品列表</h2>
        <button class="btn btn-primary" @click="openModal()">
          添加商品
        </button>
      </div>
      
      <div class="filter-bar" style="margin-bottom: 15px;">
        <label style="margin-right: 10px;">分类筛选：</label>
        <select v-model="filterCategory" @change="loadProducts" style="padding: 8px; min-width: 150px;">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div v-if="products.length === 0" class="empty-state">
        暂无商品数据
      </div>

      <table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>商品名称</th>
            <th>分类</th>
            <th>价格</th>
            <th>单位</th>
            <th>描述</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>
              <span class="badge">{{ product.category_name }}</span>
            </td>
            <td class="price-tag">¥{{ product.price.toFixed(2) }}</td>
            <td>{{ product.unit }}</td>
            <td>{{ product.description || '-' }}</td>
            <td>
              <button class="btn btn-warning btn-sm" @click="editProduct(product)" style="margin-right: 5px;">
                编辑
              </button>
              <button class="btn btn-danger btn-sm" @click="deleteProduct(product)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEdit ? '编辑商品' : '添加商品' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>商品名称</label>
            <input v-model="form.name" type="text" placeholder="请输入商品名称" />
          </div>
          <div class="form-group">
            <label>商品分类</label>
            <select v-model="form.category_id">
              <option value="">请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>商品价格</label>
            <input v-model="form.price" type="number" step="0.01" min="0" placeholder="请输入商品价格" />
          </div>
          <div class="form-group">
            <label>计量单位</label>
            <select v-model="form.unit">
              <option value="斤">斤</option>
              <option value="个">个</option>
              <option value="盒">盒</option>
              <option value="箱">箱</option>
              <option value="克">克</option>
              <option value="千克">千克</option>
            </select>
          </div>
          <div class="form-group">
            <label>商品描述</label>
            <textarea v-model="form.description" rows="3" placeholder="请输入商品描述（可选）"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn btn-success" @click="saveProduct">{{ isEdit ? '保存' : '添加' }}</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script>
import { getCategories, getProducts, createProduct, updateProduct, deleteProduct } from '../api'

export default {
  name: 'ProductList',
  data() {
    return {
      products: [],
      categories: [],
      filterCategory: '',
      showModal: false,
      isEdit: false,
      editId: null,
      form: {
        name: '',
        category_id: '',
        price: '',
        unit: '斤',
        description: ''
      },
      toast: {
        show: false,
        message: '',
        type: 'success'
      }
    }
  },
  async mounted() {
    await this.loadCategories()
    await this.loadProducts()
  },
  methods: {
    async loadCategories() {
      try {
        const res = await getCategories()
        if (res.code === 200) {
          this.categories = res.data || []
        }
      } catch (err) {
        this.showToast('加载分类失败', 'error')
      }
    },
    async loadProducts() {
      try {
        const res = await getProducts(this.filterCategory)
        if (res.code === 200) {
          this.products = res.data || []
        }
      } catch (err) {
        this.showToast('加载商品失败', 'error')
      }
    },
    openModal(product = null) {
      if (product) {
        this.isEdit = true
        this.editId = product.id
        this.form = {
          name: product.name,
          category_id: product.category_id,
          price: product.price,
          unit: product.unit,
          description: product.description
        }
      } else {
        this.isEdit = false
        this.editId = null
        this.form = {
          name: '',
          category_id: '',
          price: '',
          unit: '斤',
          description: ''
        }
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
    },
    editProduct(product) {
      this.openModal(product)
    },
    async saveProduct() {
      if (!this.form.name.trim()) {
        this.showToast('请输入商品名称', 'error')
        return
      }
      if (!this.form.category_id) {
        this.showToast('请选择商品分类', 'error')
        return
      }
      if (!this.form.price || parseFloat(this.form.price) <= 0) {
        this.showToast('请输入有效的商品价格', 'error')
        return
      }

      try {
        const data = {
          name: this.form.name.trim(),
          category_id: parseInt(this.form.category_id),
          price: parseFloat(this.form.price),
          unit: this.form.unit,
          description: this.form.description.trim()
        }

        let res
        if (this.isEdit) {
          res = await updateProduct(this.editId, data)
        } else {
          res = await createProduct(data)
        }

        if (res.code === 200) {
          this.showToast(this.isEdit ? '更新成功' : '添加成功', 'success')
          this.closeModal()
          await this.loadProducts()
        } else {
          this.showToast(res.message || '操作失败', 'error')
        }
      } catch (err) {
        this.showToast('操作失败', 'error')
      }
    },
    async deleteProduct(product) {
      if (!confirm(`确定要删除商品"${product.name}"吗？`)) {
        return
      }

      try {
        const res = await deleteProduct(product.id)
        if (res.code === 200) {
          this.showToast('删除成功', 'success')
          await this.loadProducts()
        } else {
          this.showToast(res.message || '删除失败', 'error')
        }
      } catch (err) {
        this.showToast('删除失败', 'error')
      }
    },
    showToast(message, type = 'success') {
      this.toast = {
        show: true,
        message,
        type
      }
      setTimeout(() => {
        this.toast.show = false
      }, 2000)
    }
  }
}
</script>
