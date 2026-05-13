<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">排班表</div>
      <div style="font-size: 12px; opacity: 0.9; margin-top: 4px">{{ currentMonth }}月</div>
    </div>
    
    <div class="page-content">
      <van-picker
        ref="picker"
        show-toolbar
        title="选择月份"
        :columns="monthColumns"
        :value="currentMonthIndex"
        @confirm="onMonthConfirm"
        @cancel="showMonthPicker = false"
        v-model:show="showMonthPicker"
      />
      
      <van-cell-group inset style="margin-bottom: 12px">
        <van-cell
          is-link
          :title="`${currentYear}年${currentMonth}月`"
          @click="showMonthPicker = true"
        />
      </van-cell-group>
      
      <div class="card" v-if="loading">
        <van-loading type="spinner" color="#1989fa" style="display: block; padding: 40px" />
      </div>
      
      <div class="card" v-else-if="schedules.length === 0">
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <div>暂无排班数据</div>
          <div style="font-size: 12px; margin-top: 8px">点击下方"登记排班"添加排班</div>
        </div>
      </div>
      
      <div v-else>
        <div class="card" style="overflow-x: auto">
          <table class="schedule-table">
            <thead>
              <tr>
                <th style="min-width: 60px">技师</th>
                <th v-for="day in days" :key="day" style="min-width: 50px">
                  {{ formatDay(day) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tech in technicians" :key="tech.id">
                <td style="font-weight: 500">{{ tech.name }}</td>
                <td v-for="day in days" :key="day">
                  <span
                    v-if="getSchedule(tech.id, day)"
                    :class="['shift-badge', 'shift-' + getSchedule(tech.id, day).shift]"
                  >
                    {{ getShiftLabel(getSchedule(tech.id, day).shift) }}
                  </span>
                  <span v-else style="color: #c8c9cc">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="card">
          <div class="card-header">班次说明</div>
          <div class="card-body">
            <div style="display: flex; flex-wrap: wrap; gap: 8px">
              <span v-for="shift in SHIFT_OPTIONS" :key="shift.value" :class="['shift-badge', 'shift-' + shift.value]">
                {{ shift.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { showToast } from 'vant'
import dayjs from 'dayjs'
import { technicianApi, scheduleApi, SHIFT_OPTIONS } from '../api'

const loading = ref(false)
const technicians = ref([])
const schedules = ref([])
const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const showMonthPicker = ref(false)

const currentMonthIndex = computed(() => {
  return monthColumns.value.findIndex(m => m.text === `${currentYear.value}年${currentMonth.value}月`)
})

const monthColumns = computed(() => {
  const columns = []
  for (let i = -6; i <= 6; i++) {
    const d = dayjs().add(i, 'month')
    columns.push({
      text: `${d.year()}年${d.month() + 1}月`,
      value: { year: d.year(), month: d.month() + 1 }
    })
  }
  return columns
})

const days = computed(() => {
  const totalDays = dayjs(`${currentYear.value}-${currentMonth.value}`).daysInMonth()
  const result = []
  for (let i = 1; i <= totalDays; i++) {
    result.push(dayjs(`${currentYear.value}-${currentMonth.value}-${i}`).format('YYYY-MM-DD'))
  }
  return result
})

const formatDay = (dateStr) => {
  const d = dayjs(dateStr)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.date()}\n${weekdays[d.day()]}`
}

const getShiftLabel = (value) => {
  const shift = SHIFT_OPTIONS.find(s => s.value === value)
  return shift ? shift.label : value
}

const getSchedule = (techId, date) => {
  return schedules.value.find(s => s.technician === techId && s.date === date)
}

const loadData = async () => {
  loading.value = true
  try {
    const [techRes, schedRes] = await Promise.all([
      technicianApi.active(),
      scheduleApi.list({
        date_from: dayjs(`${currentYear.value}-${currentMonth.value}-01`).format('YYYY-MM-DD'),
        date_to: dayjs(`${currentYear.value}-${currentMonth.value}`).endOf('month').format('YYYY-MM-DD')
      })
    ])
    technicians.value = techRes.data
    schedules.value = schedRes.data.results || schedRes.data
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const onMonthConfirm = ({ selectedOptions }) => {
  const { year, month } = selectedOptions[0].value
  currentYear.value = year
  currentMonth.value = month
  showMonthPicker.value = false
}

watch([currentYear, currentMonth], () => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>
