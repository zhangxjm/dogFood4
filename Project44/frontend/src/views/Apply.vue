<template>
  <div class="apply-page">
    <van-nav-bar title="请假申请" left-text="返回" left-arrow @click-left="() => router.back()" />
    
    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          :value="selectedTypeName"
          is-link
          readonly
          label="请假类型"
          placeholder="请选择请假类型"
          @click="showTypePicker = true"
        />
        
        <van-field
          v-model="startDateText"
          is-link
          readonly
          label="开始日期"
          placeholder="请选择开始日期"
          @click="openStartPicker"
        />
        
        <van-field
          v-model="endDateText"
          is-link
          readonly
          label="结束日期"
          placeholder="请选择结束日期"
          @click="openEndPicker"
        />
        
        <van-field
          v-if="form.startDate && form.endDate"
          readonly
          label="请假天数"
          :value="days + ' 天'"
        />
        
        <van-field
          v-model="form.reason"
          type="textarea"
          label="请假原因"
          placeholder="请输入请假原因"
          maxlength="500"
          show-word-limit
          rows="4"
        />
      </van-cell-group>
      
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          提交申请
        </van-button>
      </div>
    </van-form>
    
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @cancel="showTypePicker = false"
        @confirm="onTypeConfirm"
      />
    </van-popup>
    
    <van-popup v-model:show="showStartDate" position="bottom">
      <van-date-picker
        v-model="pickerStartDate"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        title="选择开始日期"
        @cancel="showStartDate = false"
        @confirm="onStartDateConfirm"
      />
    </van-popup>
    
    <van-popup v-model:show="showEndDate" position="bottom">
      <van-date-picker
        v-model="pickerEndDate"
        type="date"
        :min-date="pickerMinDate"
        :max-date="maxDate"
        title="选择结束日期"
        @cancel="showEndDate = false"
        @confirm="onEndDateConfirm"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { createLeave, getEnabledLeaveTypes } from '../api'

const router = useRouter()
const loading = ref(false)
const showTypePicker = ref(false)
const showStartDate = ref(false)
const showEndDate = ref(false)
const leaveTypes = ref([])

const typeColumns = computed(() => {
  return leaveTypes.value.map(item => ({
    text: item.typeName,
    value: item.id
  }))
})

const today = new Date()
const defaultDate = [today.getFullYear(), today.getMonth() + 1, today.getDate()]

const form = reactive({
  leaveTypeId: null,
  startDate: null,
  endDate: null,
  reason: ''
})

const loadLeaveTypes = async () => {
  try {
    const res = await getEnabledLeaveTypes()
    if (res.success !== false) {
      leaveTypes.value = res
    }
  } catch (error) {
    showToast('加载请假类型失败')
  }
}

onMounted(() => {
  loadLeaveTypes()
})

const pickerStartDate = ref(defaultDate)
const pickerEndDate = ref(defaultDate)

const startDateText = computed(() => {
  return form.startDate ? formatDate(form.startDate) : ''
})

const endDateText = computed(() => {
  return form.endDate ? formatDate(form.endDate) : ''
})

const selectedTypeName = computed(() => {
  if (!form.leaveTypeId) return ''
  const type = leaveTypes.value.find(t => t.id === form.leaveTypeId)
  return type ? type.typeName : ''
})

const days = computed(() => {
  if (!form.startDate || !form.endDate) return 0
  const start = new Date(form.startDate)
  const end = new Date(form.endDate)
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
})

const minDate = new Date(today.getFullYear(), 0, 1)
const maxDate = new Date(2030, 11, 31)

const pickerMinDate = computed(() => {
  if (form.startDate) {
    const parts = form.startDate.split('-')
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  }
  return minDate
})

const formatDate = (dateStr) => {
  return dateStr
}

const formatPickerValue = (values) => {
  const year = values[0]
  const month = String(values[1]).padStart(2, '0')
  const day = String(values[2]).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const openStartPicker = () => {
  if (form.startDate) {
    const parts = form.startDate.split('-')
    pickerStartDate.value = [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])]
  } else {
    pickerStartDate.value = defaultDate
  }
  showStartDate.value = true
}

const openEndPicker = () => {
  if (form.endDate) {
    const parts = form.endDate.split('-')
    pickerEndDate.value = [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])]
  } else if (form.startDate) {
    const parts = form.startDate.split('-')
    pickerEndDate.value = [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])]
  } else {
    pickerEndDate.value = defaultDate
  }
  showEndDate.value = true
}

const onTypeConfirm = ({ selectedOptions }) => {
  form.leaveTypeId = selectedOptions[0].value
  showTypePicker.value = false
}

const onStartDateConfirm = ({ selectedValues }) => {
  form.startDate = formatPickerValue(selectedValues)
  if (form.endDate && form.startDate > form.endDate) {
    form.endDate = form.startDate
  }
  showStartDate.value = false
}

const onEndDateConfirm = ({ selectedValues }) => {
  form.endDate = formatPickerValue(selectedValues)
  showEndDate.value = false
}

const handleSubmit = async () => {
  if (!form.leaveTypeId) {
    showToast('请选择请假类型')
    return
  }
  if (!form.startDate) {
    showToast('请选择开始日期')
    return
  }
  if (!form.endDate) {
    showToast('请选择结束日期')
    return
  }
  if (!form.reason.trim()) {
    showToast('请输入请假原因')
    return
  }

  loading.value = true
  try {
    const data = {
      leaveTypeId: form.leaveTypeId,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason
    }
    const res = await createLeave(data)
    if (res.success !== false) {
      showToast('申请提交成功')
      setTimeout(() => {
        router.replace('/history')
      }, 1500)
    } else {
      showToast(res.message || '提交失败')
    }
  } catch (error) {
    showToast('提交失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.apply-page {
  padding-bottom: 30px;
}
</style>
