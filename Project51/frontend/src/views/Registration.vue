<template>
  <div class="registration">
    <h2 class="mb-4">在线挂号</h2>
    <div class="row">
      <div class="col-md-4 mb-3">
        <label class="form-label">选择科室</label>
        <select class="form-select" v-model="selectedDepartment" @change="loadSchedules">
          <option value="">请选择科室</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">选择日期</label>
        <input type="date" class="form-control" v-model="selectedDate" @change="loadSchedules">
      </div>
    </div>

    <div v-if="schedules.length > 0" class="mt-4">
      <h5>可选号源</h5>
      <div class="row">
        <div class="col-md-4 mb-3" v-for="sch in schedules" :key="sch.id">
          <div class="card h-100" :class="{ 'border-success': sch.remainingCount > 0, 'border-danger': sch.remainingCount <= 0 }">
            <div class="card-body">
              <h6 class="card-title">{{ sch.doctor?.name }} {{ sch.doctor?.title || '' }}</h6>
              <p class="card-text">
                <small class="text-muted">{{ sch.doctor?.department?.name }}</small><br>
                日期：{{ sch.scheduleDate }}<br>
                时段：{{ sch.timePeriod }} ({{ sch.startTime }} - {{ sch.endTime }})<br>
                <span :class="sch.remainingCount > 0 ? 'text-success' : 'text-danger'">
                  剩余号源：{{ sch.remainingCount }}/{{ sch.totalCount }}
                </span>
              </p>
              <button class="btn btn-primary btn-sm" 
                      :disabled="sch.remainingCount <= 0"
                      @click="selectSchedule(sch)">
                {{ sch.remainingCount > 0 ? '立即挂号' : '号已约满' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedSchedule" class="modal show" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">填写挂号信息</h5>
            <button type="button" class="btn-close" @click="selectedSchedule = null"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info mb-3">
              <strong>已选排班：</strong><br>
              医生：{{ selectedSchedule.doctor?.name }}<br>
              日期：{{ selectedSchedule.scheduleDate }} {{ selectedSchedule.timePeriod }}
            </div>
            <form @submit.prevent="submitRegistration">
              <div class="mb-3">
                <label class="form-label">患者姓名</label>
                <input type="text" class="form-control" v-model="form.patientName" required>
              </div>
              <div class="mb-3">
                <label class="form-label">联系电话</label>
                <input type="tel" class="form-control" v-model="form.patientPhone" required pattern="[0-9]{11}">
              </div>
              <div class="mb-3">
                <label class="form-label">身份证号</label>
                <input type="text" class="form-control" v-model="form.idCard">
              </div>
              <div class="mb-3">
                <label class="form-label">症状描述</label>
                <textarea class="form-control" v-model="form.symptoms" rows="2"></textarea>
              </div>
              <button type="submit" class="btn btn-primary">确认挂号</button>
              <button type="button" class="btn btn-secondary ms-2" @click="selectedSchedule = null">取消</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="selectedSchedule"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { departmentApi, scheduleApi, registrationApi } from '../api'

const departments = ref([])
const schedules = ref([])
const selectedDepartment = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedSchedule = ref(null)
const form = ref({
  patientName: '',
  patientPhone: '',
  idCard: '',
  symptoms: ''
})

const loadDepartments = async () => {
  const res = await departmentApi.getAll()
  if (res.code === 200) {
    departments.value = res.data
  }
}

const loadSchedules = async () => {
  if (!selectedDepartment.value) return
  const res = await scheduleApi.getByDepartmentAndDate(selectedDepartment.value, selectedDate.value)
  if (res.code === 200) {
    schedules.value = res.data
  }
}

const selectSchedule = (sch) => {
  selectedSchedule.value = sch
}

const submitRegistration = async () => {
  const data = {
    ...form.value,
    schedule: { id: selectedSchedule.value.id }
  }
  const res = await registrationApi.create(data)
  if (res.code === 200) {
    alert(`挂号成功！您的挂号单号：${res.data.registrationNo}`)
    selectedSchedule.value = null
    form.value = { patientName: '', patientPhone: '', idCard: '', symptoms: '' }
    loadSchedules()
  } else {
    alert(res.message || '挂号失败')
  }
}

onMounted(() => {
  loadDepartments()
})
</script>
