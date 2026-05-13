<template>
  <div>
    <div class="page-header">
      <h2>🚗 车辆管理</h2>
      <button class="btn btn-primary" @click="openModal()">+ 添加车辆</button>
    </div>

    <div class="card">
      <div class="search-bar">
        <input
          v-model="keyword"
          placeholder="搜索车牌号、品牌..."
          @input="loadVehicles"
        />
        <select v-model="ownerFilter" @change="loadVehicles">
          <option value="">全部车主</option>
          <option v-for="owner in owners" :key="owner.id" :value="owner.id">
            {{ owner.name }}
          </option>
        </select>
      </div>

      <table v-if="vehicles.length > 0">
        <thead>
          <tr>
            <th>车牌号</th>
            <th>车主</th>
            <th>车辆类型</th>
            <th>品牌</th>
            <th>型号</th>
            <th>颜色</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in vehicles" :key="vehicle.id">
            <td><strong>{{ vehicle.plate_number }}</strong></td>
            <td>{{ vehicle.owner?.name || '-' }}</td>
            <td>{{ vehicle.vehicle_type || '-' }}</td>
            <td>{{ vehicle.brand || '-' }}</td>
            <td>{{ vehicle.model || '-' }}</td>
            <td>{{ vehicle.color || '-' }}</td>
            <td>
              <div class="action-btns">
                <button class="btn btn-secondary" @click="openModal(vehicle)">编辑</button>
                <button class="btn btn-danger" @click="deleteVehicle(vehicle)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <h4>暂无车辆记录</h4>
        <p>点击右上角"添加车辆"开始录入</p>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editingVehicle ? '编辑车辆' : '添加车辆' }}</h3>
        <form @submit.prevent="saveVehicle">
          <div class="form-group">
            <label>车牌号 *</label>
            <input v-model="form.plate_number" required placeholder="如：京A12345" />
          </div>
          <div class="form-group">
            <label>车主</label>
            <select v-model="form.owner_id">
              <option value="">请选择车主（可选）</option>
              <option v-for="owner in owners" :key="owner.id" :value="owner.id">
                {{ owner.name }} - {{ owner.phone }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>车辆类型</label>
            <select v-model="form.vehicle_type">
              <option value="">请选择</option>
              <option value="轿车">轿车</option>
              <option value="SUV">SUV</option>
              <option value="MPV">MPV</option>
              <option value="货车">货车</option>
              <option value="摩托车">摩托车</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>品牌</label>
            <input v-model="form.brand" placeholder="如：宝马、奔驰、丰田" />
          </div>
          <div class="form-group">
            <label>型号</label>
            <input v-model="form.model" placeholder="如：X5、E300L" />
          </div>
          <div class="form-group">
            <label>颜色</label>
            <input v-model="form.color" placeholder="如：黑色、白色" />
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

const vehicles = ref([])
const owners = ref([])
const keyword = ref('')
const ownerFilter = ref('')
const showModal = ref(false)
const editingVehicle = ref(null)
const form = ref({
  plate_number: '',
  owner_id: '',
  vehicle_type: '',
  brand: '',
  model: '',
  color: '',
  note: ''
})

const loadVehicles = async () => {
  try {
    const params = {}
    if (keyword.value) params.keyword = keyword.value
    if (ownerFilter.value) params.owner_id = ownerFilter.value
    const res = await api.getVehicles(params)
    vehicles.value = res.data.data || []
  } catch (error) {
    console.error('Failed to load vehicles:', error)
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

const openModal = (vehicle = null) => {
  editingVehicle.value = vehicle
  if (vehicle) {
    form.value = { ...vehicle }
  } else {
    form.value = {
      plate_number: '',
      owner_id: '',
      vehicle_type: '',
      brand: '',
      model: '',
      color: '',
      note: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingVehicle.value = null
}

const saveVehicle = async () => {
  try {
    if (editingVehicle.value) {
      await api.updateVehicle(editingVehicle.value.id, form.value)
    } else {
      await api.createVehicle(form.value)
    }
    closeModal()
    loadVehicles()
  } catch (error) {
    alert('保存失败：' + (error.response?.data?.message || error.message))
  }
}

const deleteVehicle = async (vehicle) => {
  if (!confirm(`确定要删除车辆 "${vehicle.plate_number}" 吗？`)) return
  try {
    await api.deleteVehicle(vehicle.id)
    loadVehicles()
  } catch (error) {
    alert('删除失败：' + (error.response?.data?.message || error.message))
  }
}

onMounted(() => {
  loadVehicles()
  loadOwners()
})
</script>
