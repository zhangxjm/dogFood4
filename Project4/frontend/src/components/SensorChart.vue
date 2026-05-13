<template>
  <div class="chart-container">
    <div class="chart-title">
      <span>📈</span>
      <span>{{ title }}</span>
    </div>
    <div ref="chartRef" class="chart-wrapper"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: { type: String, default: '传感器数据' },
  dataKey: { type: String, required: true },
  historyData: { type: Array, default: () => [] },
  color: { type: String, default: '#4fc3f7' }
})

const chartRef = ref(null)
let chart = null

const getChartOption = () => {
  const times = props.historyData.map(d => {
    const t = new Date(d.timestamp)
    return `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`
  })
  const values = props.historyData.map(d => d[props.dataKey] || 0)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#4fc3f7',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }
    },
    series: [{
      name: props.title,
      type: 'line',
      smooth: true,
      symbol: 'none',
      sampling: 'lttb',
      itemStyle: { color: props.color },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: props.color + '60' },
          { offset: 1, color: props.color + '05' }
        ])
      },
      lineStyle: { width: 2 },
      data: values
    }]
  }
}

const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption(getChartOption())
  }
}

const resizeChart = () => {
  chart?.resize()
}

watch(() => props.historyData, () => {
  if (chart) {
    chart.setOption(getChartOption())
  }
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})
</script>
