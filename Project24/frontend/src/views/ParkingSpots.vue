<template>
  <div>
    <div class="page-header">
      <h2>🅿️ 车位管理</h2>
      <button class="btn btn-primary" @click="openModal()">+ 添加车位</button>
    </div>

    <div class="card">
      <div class="search-bar">
        <input
          v-model="keyword"
          placeholder="搜索车位号、位置..."
          @input="loadSpots"
        />
        <select v-model="statusFilter" @change="loadSpots">
          <option value="">全部状态</option>
          <option value="true">空闲</option>
          <option value="false">已占用</option>
        </select>
      </div>

      <table v-if="spots.length > 0">
        <thead>
          <tr>
            <th>车位编号</th>
            <th>位置</th>
            <th>状态</th>
            <th>绑定车主</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="spot in spots" :key="spot.id">
            <td><strong>{{ spot.spot_number }}</strong></td>
            <td>{{ spot.location || '-' }}</td>
            <td>
              <span :class="['badge', spot.owner_id ? 'badge-danger' : 'badge-success']">
                {{ spot.owner_id ? '已占用' : '空闲' }}
              </span>
            </td>
            <td>{{ spot.owner?.name || '-' }}</td>
            <td>
              <div class="action-btns">
                <button class="btn btn-secondary" @click="openModal(spot)">编辑</button>
                <button class="btn btn-danger" @click="deleteSpot(spot)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <h4>暂无车位记录</h4>
        <p>点击右上角"添加车位"开始录入</p>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editingSpot ? '编辑车位' : '添加车位' }}</h3>
        <form @submit.prevent="saveSpot">
          <div class="form-group">
            <label>车位编号 *</label>
            <input v-model="form.spot_number" required placeholder="如：A01、B102" />
          </div>
          <div class="form-group">
            <label>位置</label>
            <input v-model="form.location" placeholder="如：地下1层、A区" />
          </div>
          <div class="form-group">
            <label>绑定车主</label>
            <select v-model="selectedOwner">
              <option value="">不绑定（空闲）</option>
              <option v-for="owner in owners" :key="owner.id" :value="owner.id">
                {{ owner.name }} - {{ owner.phone }}
              </option>
            </select>
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
import { ref, onMounted, computed } from 'vue'
import api from '../api'

const spots = ref([])
const owners = ref([])
const keyword = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editingSpot = ref(null)
const form = ref({
  spot_number: '',
  location: '',
  note: ''
})
const selectedOwner = ref('')

const loadSpots = async () => {
  try {
    const params = {}
    if (keyword.value) params.keyword = keyword.value
    if (statusFilter.value) params.available = statusFilter.value
    const res = await api.getParkingSpots(params)
    spots.value = res.data.data || []
  } catch (error) {
    console.error('Failed to load spots:', error)
  }
}

const loadOwners = async () => {
  try {
    const res = await api.getOwners()
    owners.value = res.data.data || []
  } catch (error) {
    console.error('Failed to load owners:', error)
  }
}

const openModal = (spot = null) => {
  editingSpot.value = spot
  if (spot) {
    form.value = { ...spot }
    selectedOwner.value = spot.owner_id || ''
  } else {
    form.value = {
      spot_number: '',
      location: '',
      note: ''
    }
    selectedOwner.value = ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingSpot.value = null
}

const saveSpot = async () => {
  try {
    const payload = {
      ...form.value,
      owner_id: selectedOwner.value || null
    }
    
    if (editingSpot.value) {
      await api.updateParkingSpot(editingSpot.value.id, payload)
    } else {
      await api.createParkingSpot(payload)
    }
    closeModal()
    loadSpots()
  } catch (error) {
    alert('保存失败：' + (error.response?.data?.message || error.message))
  }
}

const deleteSpot = async (spot) => {
  if (!confirm(`确定要删除车位 "${spot.spot_number}" 吗？`)) return
  try {
    await api.deleteParkingSpot(spot.id)
    loadSpots()
  } catch (error) {
    alert('删除失败：' + (error.response?.data?.message || error.message))
  }
}

onMounted(() => {
  loadSpots()
  loadOwners()
})
</script>
