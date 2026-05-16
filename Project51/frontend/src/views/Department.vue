<template>
  <div class="department">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>科室管理</h2>
      <button class="btn btn-primary" @click="showAddModal = true">新增科室</button>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>科室名称</th>
          <th>描述</th>
          <th>排序</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dept in departments" :key="dept.id">
          <td>{{ dept.id }}</td>
          <td>{{ dept.name }}</td>
          <td>{{ dept.description || '-' }}</td>
          <td>{{ dept.sortOrder }}</td>
          <td>
            <span :class="dept.status ? 'badge bg-success' : 'badge bg-danger'">
              {{ dept.status ? '启用' : '禁用' }}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-2" @click="editDepartment(dept)">编辑</button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteDepartment(dept.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="modal" :class="{ show: showAddModal }" style="display: block;" v-if="showAddModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingDept ? '编辑科室' : '新增科室' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDepartment">
              <div class="mb-3">
                <label class="form-label">科室名称</label>
                <input type="text" class="form-control" v-model="form.name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">描述</label>
                <textarea class="form-control" v-model="form.description" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">排序</label>
                <input type="number" class="form-control" v-model.number="form.sortOrder" required>
              </div>
              <div class="mb-3">
                <label class="form-label">状态</label>
                <select class="form-select" v-model="form.status">
                  <option :value="true">启用</option>
                  <option :value="false">禁用</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">保存</button>
              <button type="button" class="btn btn-secondary ms-2" @click="closeModal">取消</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddModal"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { departmentApi } from '../api'

const departments = ref([])
const showAddModal = ref(false)
const editingDept = ref(null)
const form = ref({ name: '', description: '', sortOrder: 0, status: true })

const loadDepartments = async () => {
  const res = await departmentApi.getAll()
  if (res.code === 200) {
    departments.value = res.data
  }
}

const editDepartment = (dept) => {
  editingDept.value = dept
  form.value = { ...dept }
  showAddModal.value = true
}

const saveDepartment = async () => {
  if (editingDept.value) {
    await departmentApi.update(editingDept.value.id, form.value)
  } else {
    await departmentApi.create(form.value)
  }
  closeModal()
  loadDepartments()
}

const deleteDepartment = async (id) => {
  if (confirm('确定要删除这个科室吗？')) {
    await departmentApi.delete(id)
    loadDepartments()
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingDept.value = null
  form.value = { name: '', description: '', sortOrder: 0, status: true }
}

onMounted(() => {
  loadDepartments()
})
</script>
