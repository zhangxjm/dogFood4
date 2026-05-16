<template>
  <div class="record">
    <h2 class="mb-4">挂号记录</h2>
    <div class="row mb-3">
      <div class="col-md-4">
        <label class="form-label">按手机号查询</label>
        <div class="input-group">
          <input type="text" class="form-control" v-model="searchPhone" placeholder="请输入手机号">
          <button class="btn btn-outline-primary" @click="searchByPhone">查询</button>
        </div>
      </div>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>挂号单号</th>
          <th>患者姓名</th>
          <th>联系电话</th>
          <th>医生</th>
          <th>科室</th>
          <th>就诊日期</th>
          <th>时段</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reg in registrations" :key="reg.id">
          <td>{{ reg.registrationNo }}</td>
          <td>{{ reg.patientName }}</td>
          <td>{{ reg.patientPhone }}</td>
          <td>{{ reg.schedule?.doctor?.name }}</td>
          <td>{{ reg.schedule?.doctor?.department?.name }}</td>
          <td>{{ reg.schedule?.scheduleDate }}</td>
          <td>{{ reg.schedule?.timePeriod }}</td>
          <td>
            <span :class="getStatusClass(reg.status)">
              {{ getStatusText(reg.status) }}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger" 
                    :disabled="reg.status === 2"
                    @click="cancelRegistration(reg.id)">
              取消挂号
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { registrationApi } from '../api'

const registrations = ref([])
const searchPhone = ref('')

const loadAllRegistrations = async () => {
  const res = await registrationApi.getAll()
  if (res.code === 200) {
    registrations.value = res.data
  }
}

const searchByPhone = async () => {
  if (!searchPhone.value) {
    loadAllRegistrations()
    return
  }
  const res = await registrationApi.getByPhone(searchPhone.value)
  if (res.code === 200) {
    registrations.value = res.data
  }
}

const cancelRegistration = async (id) => {
  if (confirm('确定要取消这个挂号吗？')) {
    await registrationApi.cancel(id)
    loadAllRegistrations()
  }
}

const getStatusText = (status) => {
  const map = { 0: '待就诊', 1: '已就诊', 2: '已取消' }
  return map[status] || '未知'
}

const getStatusClass = (status) => {
  const map = { 0: 'badge bg-warning', 1: 'badge bg-success', 2: 'badge bg-secondary' }
  return map[status] || 'badge bg-secondary'
}

onMounted(() => {
  loadAllRegistrations()
})
</script>
