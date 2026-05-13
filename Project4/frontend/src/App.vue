<template>
  <div>
    <header class="header">
      <h1>📡 物联网设备监控平台</h1>
      <div class="time">
        <span :style="{ color: isConnected ? '#4caf50' : '#f44336' }">
          {{ isConnected ? '● 已连接' : '○ 断开中' }}
        </span>
        <span style="margin-left: 15px;">{{ currentTime }}</span>
      </div>
    </header>

    <main class="main-container">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <StatsPanel />
        <DeviceList />
      </div>

      <div style="display: flex; flex-direction: column; gap: 20px;">
        <DeviceDetail :device="selectedDevice" />
        <div class="charts-grid">
          <SensorChart
            v-if="selectedDevice"
            title="温度趋势"
            dataKey="temperature"
            :historyData="currentHistory"
            color="#4fc3f7"
          />
          <SensorChart
            v-if="selectedDevice"
            title="湿度趋势"
            dataKey="humidity"
            :historyData="currentHistory"
            color="#81c784"
          />
        </div>
      </div>

      <AlertList />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMonitorStore } from './stores'
import { wsManager } from './utils/websocket'
import StatsPanel from './components/StatsPanel.vue'
import DeviceList from './components/DeviceList.vue'
import DeviceDetail from './components/DeviceDetail.vue'
import SensorChart from './components/SensorChart.vue'
import AlertList from './components/AlertList.vue'

const store = useMonitorStore()
const selectedDevice = computed(() => store.selectedDevice)
const isConnected = computed(() => store.isConnected)

const currentTime = ref('')
let timeInterval = null

const currentHistory = computed(() => {
  if (!selectedDevice.value) return []
  return store.sensorHistory[selectedDevice.value.id] || []
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  wsManager.connect()
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  wsManager.disconnect()
})
</script>
