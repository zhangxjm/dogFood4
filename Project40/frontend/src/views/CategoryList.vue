<template>
  <div class="category-list">
    <div class="card">
      <div class="card-header">
        <h2>分类列表</h2>
        <button class="btn btn-primary" @click="openModal()">
          添加分类
        </button>
      </div>

      <div v-if="categories.length === 0" class="empty-state">
        暂无分类数据
      </div>

      <table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>分类名称</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.id }}</td>
            <td>{{ category.name }}</td>
            <td>{{ formatTime(category.created_at) }}</td>
            <td>{{ formatTime(category.updated_at) }}</td>
            <td>
              <button class="btn btn-warning btn-sm" @click="editCategory(category)" style="margin-right: 5px;">
                编辑
              </button>
              <button class="btn btn-danger btn-sm" @click="deleteCategory(category)">
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
          <h3>{{ isEdit ? '编辑分类' : '添加分类' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>分类名称</label>
            <input v-model="form.name" type="text" placeholder="请输入分类名称" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn btn-success" @click="saveCategory">{{ isEdit ? '保存' : '添加' }}</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script>
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api'

export default {
  name: 'CategoryList',
  data() {
    return {
      categories: [],
      showModal: false,
      isEdit: false,
      editId: null,
      form: {
        name: ''
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
    formatTime(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-CN')
    },
    openModal(category = null) {
      if (category) {
        this.isEdit = true
        this.editId = category.id
        this.form = {
          name: category.name
        }
      } else {
        this.isEdit = false
        this.editId = null
        this.form = {
          name: ''
        }
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
    },
    editCategory(category) {
      this.openModal(category)
    },
    async saveCategory() {
      if (!this.form.name.trim()) {
        this.showToast('请输入分类名称', 'error')
        return
      }

      try {
        const data = {
          name: this.form.name.trim()
        }

        let res
        if (this.isEdit) {
          res = await updateCategory(this.editId, data)
        } else {
          res = await createCategory(data)
        }

        if (res.code === 200) {
          this.showToast(this.isEdit ? '更新成功' : '添加成功', 'success')
          this.closeModal()
          await this.loadCategories()
        } else {
          this.showToast(res.message || '操作失败', 'error')
        }
      } catch (err) {
        this.showToast('操作失败', 'error')
      }
    },
    async deleteCategory(category) {
      if (!confirm(`确定要删除分类"${category.name}"吗？\n注意：该分类下有商品时无法删除。`)) {
        return
      }

      try {
        const res = await deleteCategory(category.id)
        if (res.code === 200) {
          this.showToast('删除成功', 'success')
          await this.loadCategories()
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
