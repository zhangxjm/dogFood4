<template>
  <div>
    <div class="page-header">
      <h2>👤 车主信息</h2>
      <button class="btn btn-primary" @click="openModal()">+ 添加车主</button>
    </div>

    <div class="card">
      <div class="search-bar">
        <input
          v-model="keyword"
          placeholder="搜索姓名、电话、地址..."
          @input="loadOwners"
        />
      </div>

      <table v-if="owners.length > 0">
        <thead>
          <tr>
            <th>姓名</th>
            <th>联系电话</th>
            <th>地址</th>
            <th>车辆数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="owner in owners" :key="owner.id">
            <td><strong>{{ owner.name }}</strong></td>
            <td>{{ owner.phone }}</td>
            <td>{{ owner.address || '-' }}</td>
            <td>
              <span class="badge badge-success">{{ owner.vehicles?.length || 0 }} 辆</span>
            </td>
            <td>
              <div class="action-btns">
                <button class="btn btn-secondary" @click="openModal(owner)">编辑</button>
                <button class="btn btn-danger" @click="deleteOwner(owner)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <h4>暂无车主记录</h4>
        <p>点击右上角"添加车主"开始录入</p>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editingOwner ? '编辑车主' : '添加车主' }}</h3>
        <form @submit.prevent="saveOwner">
          <div class="form-group">
            <label>姓名 *</label>
            <input v-model="form.name" required placeholder="车主姓名" />
          </div>
          <div class="form-group">
            <label>联系电话 *</label>
            <input v-model="form.phone" required placeholder="手机号码" />
          </div>
          <div class="form-group">
            <label>地址</label>
            <input v-model="form.address" placeholder="住址或门牌号" />
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="form.note" placeholder="其他信息"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const owners = ref([])
const keyword = ref('')
const showModal = ref(false)
const editingOwner = ref(null)
const form = ref({
  name: '',
  phone: '',
  address: '',
  note: ''
})

const loadOwners = async () => {
  try {
    const params = keyword.value ? { keyword: keyword.value } : {}
    const res = await api.getOwners(params)
    owners.value = res.data.data || []
  } catch (error) {
    console.error('Failed to load owners:', error)
  }
}

const openModal = (owner = null) => {
  editingOwner.value = owner
  if (owner) {
    form.value = { ...owner }
  } else {
    form.value = {
      name: '',
      phone: '',
      address: '',
      note: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingOwner.value = null
}

const saveOwner = async () => {
  try {
    if (editingOwner.value) {
      await api.updateOwner(editingOwner.value.id, form.value)
    } else {
      await api.createOwner(form.value)
    }
    closeModal()
    loadOwners()
  } catch (error) {
    alert('保存失败：' + (error.response?.data?.message || error.message))
  }
}

const deleteOwner = async (owner) => {
  if (!confirm(`确定要删除车主 "${owner.name}" 吗？\n\n注意：该车主的所有车辆也将被一并删除！`)) return
  try {
    await api.deleteOwner(owner.id)
    loadOwners()
  } catch (error) {
    alert('删除失败：' + (error.response?.data?.message || error.message))
  }
}

onMounted(() => {
  loadOwners()
})
</script>
