<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">登记排班</div>
      <div style="font-size: 12px; opacity: 0.9; margin-top: 4px">快速为技师添加排班</div>
    </div>
    
    <div class="page-content">
      <div class="card">
        <div class="card-header">选择日期</div>
        <div class="card-body">
          <van-calendar
            type="range"
            v-model:show="showCalendar"
            v-model="selectedDates"
            color="#1989fa"
            @confirm="onDateConfirm"
          />
          <van-cell
            is-link
            :title="selectedDateText"
            value="点击选择"
            @click="showCalendar = true"
          />
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">选择技师</div>
        <div class="card-body">
          <div v-if="loading" style="padding: 20px; text-align: center">
            <van-loading type="spinner" color="#1989fa" />
          </div>
          <div v-else-if="technicians.length === 0" class="empty-state" style="padding: 20px">
            <div>暂无在职技师</div>
            <div style="font-size: 12px; margin-top: 4px">请先在"技师管理"中添加</div>
          </div>
          <van-checkbox-group v-model="selectedTechnicians" v-else>
            <van-cell
              v-for="tech in technicians"
              :key="tech.id"
              clickable
              @click="toggleTech(tech.id)"
            >
              <template #title>
                <van-checkbox :name="tech.id" :checked="selectedTechnicians.includes(tech.id)">
                  {{ tech.name }}
                  <span v-if="tech.position" style="color: #969799; font-size: 12px; margin-left: 8px">
                    {{ tech.position }}
                  </span>
                </van-checkbox>
              </template>
            </van-cell>
          </van-checkbox-group>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">选择班次</div>
        <div class="card-body">
          <van-radio-group v-model="selectedShift">
            <van-grid :column-num="5" :border="false">
              <van-grid-item v-for="shift in SHIFT_OPTIONS" :key="shift.value">
                <van-radio :name="shift.value">
                  <span :class="['shift-badge', 'shift-' + shift.value]" style="cursor: pointer">
                    {{ shift.label }}
                  </span>
                </van-radio>
              </van-grid-item>
            </van-grid>
          </van-radio-group>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">备注（可选）</div>
        <div class="card-body">
          <van-field
            v-model="notes"
            type="textarea"
            rows="2"
            placeholder="输入备注信息..."
          />
        </div>
      </div>
      
      <van-button
        type="primary"
        block
        round
        :loading="submitting"
        :disabled="!canSubmit"
        @click="submit"
        style="margin-top: 16px"
      >
        提交排班
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import dayjs from 'dayjs'
import { technicianApi, scheduleApi, SHIFT_OPTIONS } from '../api'

const loading = ref(false)
const submitting = ref(false)
const showCalendar = ref(false)
const technicians = ref([])
const selectedDates = ref([])
const selectedTechnicians = ref([])
const selectedShift = ref('full')
const notes = ref('')

const selectedDateText = computed(() => {
  if (selectedDates.value.length === 0) return '请选择日期'
  if (selectedDates.value.length === 1) {
    return dayjs(selectedDates.value[0]).format('YYYY-MM-DD')
  }
  const sorted = [...selectedDates.value].sort((a, b) => new Date(a) - new Date(b))
  return `${dayjs(sorted[0]).format('MM-DD')} 至 ${dayjs(sorted[sorted.length - 1]).format('MM-DD')} (${selectedDates.value.length}天)`
})

const canSubmit = computed(() => {
  return selectedDates.value.length > 0 && selectedTechnicians.value.length > 0
})

const toggleTech = (id) => {
  const idx = selectedTechnicians.value.indexOf(id)
  if (idx > -1) {
    selectedTechnicians.value.splice(idx, 1)
  } else {
    selectedTechnicians.value.push(id)
  }
}

const onDateConfirm = () => {
  showCalendar.value = false
}

const loadTechnicians = async () => {
  loading.value = true
  try {
    const res = await technicianApi.active()
    technicians.value = res.data
  } catch (e) {
    showToast('加载技师失败')
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!canSubmit.value) {
    showToast('请选择日期和技师')
    return
  }
  
  submitting.value = true
  try {
    const dates = selectedDates.value.map(d => dayjs(d).format('YYYY-MM-DD'))
    await scheduleApi.batchCreate({
      dates,
      technicians: selectedTechnicians.value,
      shift: selectedShift.value,
      notes: notes.value
    })
    showSuccessToast('排班成功')
    selectedDates.value = []
    selectedTechnicians.value = []
    notes.value = ''
  } catch (e) {
    const msg = e.response?.data?.error || '排班失败，请重试'
    showToast(msg)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadTechnicians()
})
</script>
