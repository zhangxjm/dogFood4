<template>
  <div class="doctor">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>医生管理</h2>
      <button class="btn btn-primary" @click="showAddModal = true">新增医生</button>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>所属科室</th>
          <th>职称</th>
          <th>专长</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in doctors" :key="doc.id">
          <td>{{ doc.id }}</td>
          <td>{{ doc.name }}</td>
          <td>{{ doc.department?.name }}</td>
          <td>{{ doc.title || '-' }}</td>
          <td>{{ doc.specialty || '-' }}</td>
          <td>
            <span :class="doc.status ? 'badge bg-success' : 'badge bg-danger'">
              {{ doc.status ? '启用' : '禁用' }}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-2" @click="editDoctor(doc)">编辑</button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteDoctor(doc.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="modal" :class="{ show: showAddModal }" style="display: block;" v-if="showAddModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingDoc ? '编辑医生' : '新增医生' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDoctor">
              <div class="mb-3">
                <label class="form-label">姓名</label>
                <input type="text" class="form-control" v-model="form.name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">所属科室</label>
                <select class="form-select" v-model="form.department.id" required>
                  <option value="">请选择科室</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">职称</label>
                <input type="text" class="form-control" v-model="form.title">
              </div>
              <div class="mb-3">
                <label class="form-label">专长</label>
                <textarea class="form-control" v-model="form.specialty" rows="2"></textarea>
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
import { doctorApi, departmentApi } from '../api'

const doctors = ref([])
const departments = ref([])
const showAddModal = ref(false)
const editingDoc = ref(null)
const form = ref({ name: '', department: { id: null }, title: '', specialty: '', status: true })

const loadDoctors = async () => {
  const res = await doctorApi.getAll()
  if (res.code === 200) {
    doctors.value = res.data
  }
}

const loadDepartments = async () => {
  const res = await departmentApi.getAll()
  if (res.code === 200) {
    departments.value = res.data
  }
}

const editDoctor = (doc) => {
  editingDoc.value = doc
  form.value = { ...doc, department: { id: doc.department.id } }
  showAddModal.value = true
}

const saveDoctor = async () => {
  if (editingDoc.value) {
    await doctorApi.update(editingDoc.value.id, form.value)
  } else {
    await doctorApi.create(form.value)
  }
  closeModal()
  loadDoctors()
}

const deleteDoctor = async (id) => {
  if (confirm('确定要删除这个医生吗？')) {
    await doctorApi.delete(id)
    loadDoctors()
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingDoc.value = null
  form.value = { name: '', department: { id: null }, title: '', specialty: '', status: true }
}

onMounted(() => {
  loadDoctors()
  loadDepartments()
})
</script>
