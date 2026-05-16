<template>
  <div class="statistics-page">
    <van-nav-bar title="请假统计" left-text="返回" left-arrow @click-left="() => router.back()" />
    
    <van-cell-group inset>
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
    </van-cell-group>
    
    <van-button type="primary" block round style="margin: 16px;" @click="loadStatistics">
      查询统计
    </van-button>
    
    <van-cell-group inset v-if="statistics.length > 0" title="各班级请假统计">
      <van-cell
        v-for="item in statistics"
        :key="item.className"
        :title="item.className"
        :value="item.count + ' 人次'"
      />
    </van-cell-group>
    
    <van-empty v-if="loaded && statistics.length === 0" description="暂无统计数据" />
    <van-loading v-if="loading" style="margin-top: 50px;" />
    
    <van-popup v-model:show="showStartDate" position="bottom">
      <van-date-picker
        v-model="pickerStartDate"
        type="date"
        title="选择开始日期"
        @cancel="showStartDate = false"
        @confirm="onStartDateConfirm"
      />
    </van-popup>
    
    <van-popup v-model:show="showEndDate" position="bottom">
      <van-date-picker
        v-model="pickerEndDate"
        type="date"
        title="选择结束日期"
        @cancel="showEndDate = false"
        @confirm="onEndDateConfirm"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAllClassStatistics } from '../api'

const router = useRouter()
const loading = ref(false)
const loaded = ref(false)
const showStartDate = ref(false)
const showEndDate = ref(false)

const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

const formStartDate = ref(formatDateObj(firstDay))
const formEndDate = ref(formatDateObj(today))

const pickerStartDate = ref(dateToPicker(firstDay))
const pickerEndDate = ref(dateToPicker(today))

const statistics = ref([])

function dateToPicker(date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
}

function pickerToDate(values) {
  return new Date(values[0], values[1] - 1, values[2])
}

function formatDateObj(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const startDateText = computed(() => formStartDate.value)
const endDateText = computed(() => formEndDate.value)

const openStartPicker = () => {
  if (formStartDate.value) {
    const parts = formStartDate.value.split('-')
    pickerStartDate.value = [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])]
  }
  showStartDate.value = true
}

const openEndPicker = () => {
  if (formEndDate.value) {
    const parts = formEndDate.value.split('-')
    pickerEndDate.value = [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])]
  }
  showEndDate.value = true
}

const onStartDateConfirm = ({ selectedValues }) => {
  formStartDate.value = formatDateObj(pickerToDate(selectedValues))
  showStartDate.value = false
}

const onEndDateConfirm = ({ selectedValues }) => {
  formEndDate.value = formatDateObj(pickerToDate(selectedValues))
  showEndDate.value = false
}

const loadStatistics = async () => {
  loading.value = true
  try {
    const res = await getAllClassStatistics({
      startDate: formStartDate.value,
      endDate: formEndDate.value
    })
    if (res.success) {
      statistics.value = res.data
    }
    loaded.value = true
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

loadStatistics()
</script>

<style scoped>
.statistics-page {
  padding-bottom: 30px;
}
</style>
