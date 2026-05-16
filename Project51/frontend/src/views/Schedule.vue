<template>
  <div class="schedule">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>排班管理</h2>
      <button class="btn btn-primary" @click="showAddModal = true">新增排班</button>
    </div>
    <div class="mb-3">
      <label class="form-label">选择日期</label>
      <input type="date" class="form-control w-25" v-model="selectedDate" @change="loadSchedules">
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>医生</th>
          <th>科室</th>
          <th>日期</th>
          <th>时段</th>
          <th>开始时间</th>
          <th>结束时间</th>
          <th>总号源</th>
          <th>剩余号源</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sch in schedules" :key="sch.id">
          <td>{{ sch.id }}</td>
          <td>{{ sch.doctor?.name }}</td>
          <td>{{ sch.doctor?.department?.name }}</td>
          <td>{{ sch.scheduleDate }}</td>
          <td>{{ sch.timePeriod }}</td>
          <td>{{ sch.startTime }}</td>
          <td>{{ sch.endTime }}</td>
          <td>{{ sch.totalCount }}</td>
          <td>
            <span :class="sch.remainingCount > 0 ? 'text-success' : 'text-danger'">
              {{ sch.remainingCount }}
            </span>
          </td>
          <td>
            <span :class="sch.status ? 'badge bg-success' : 'badge bg-danger'">
              {{ sch.status ? '启用' : '禁用' }}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-2" @click="editSchedule(sch)">编辑</button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteSchedule(sch.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="modal" :class="{ show: showAddModal }" style="display: block;" v-if="showAddModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingSch ? '编辑排班' : '新增排班' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSchedule">
              <div class="mb-3">
                <label class="form-label">医生</label>
                <select class="form-select" v-model="form.doctor.id" required>
                  <option value="">请选择医生</option>
                  <option v-for="doc in doctors" :key="doc.id" :value="doc.id">
                    {{ doc.name }} - {{ doc.department?.name }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">排班日期</label>
                <input type="date" class="form-control" v-model="form.scheduleDate" required>
              </div>
              <div class="mb-3">
                <label class="form-label">时段</label>
                <select class="form-select" v-model="form.timePeriod" required>
                  <option value="上午">上午</option>
                  <option value="下午">下午</option>
                </select>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">开始时间</label>
                  <input type="time" class="form-control" v-model="form.startTime" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">结束时间</label>
                  <input type="time" class="form-control" v-model="form.endTime" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">总号源数</label>
                <input type="number" class="form-control" v-model.number="form.totalCount" required min="1">
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
import { scheduleApi, doctorApi } from '../api'

const schedules = ref([])
const doctors = ref([])
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showAddModal = ref(false)
const editingSch = ref(null)
const form = ref({
  doctor: { id: null },
  scheduleDate: '',
  timePeriod: '上午',
  startTime: '08:00',
  endTime: '12:00',
  totalCount: 20,
  status: true
})

const loadSchedules = async () => {
  const res = await scheduleApi.getByDate(selectedDate.value)
  if (res.code === 200) {
    schedules.value = res.data
  }
}

const loadDoctors = async () => {
  const res = await doctorApi.getAll()
  if (res.code === 200) {
    doctors.value = res.data
  }
}

const editSchedule = (sch) => {
  editingSch.value = sch
  form.value = { ...sch, doctor: { id: sch.doctor.id } }
  showAddModal.value = true
}

const saveSchedule = async () => {
  if (editingSch.value) {
    await scheduleApi.update(editingSch.value.id, form.value)
  } else {
    await scheduleApi.create(form.value)
  }
  closeModal()
  loadSchedules()
}

const deleteSchedule = async (id) => {
  if (confirm('确定要删除这个排班吗？')) {
    await scheduleApi.delete(id)
    loadSchedules()
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingSch.value = null
  form.value = {
    doctor: { id: null },
    scheduleDate: '',
    timePeriod: '上午',
    startTime: '08:00',
    endTime: '12:00',
    totalCount: 20,
    status: true
  }
}

onMounted(() => {
  loadSchedules()
  loadDoctors()
})
</script>
