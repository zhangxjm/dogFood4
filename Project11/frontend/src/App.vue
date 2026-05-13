<template>
  <div class="app-container">
    <header class="header">
      <div class="header-left">
        <h1>⚡ 充电桩监控平台</h1>
        <span class="subtitle">Charging Station Monitoring System</span>
      </div>
      <div class="header-right">
        <div class="connection-status" :class="{ connected: wsConnected }">
          <span class="status-dot"></span>
          {{ wsConnected ? '已连接' : '未连接' }}
        </div>
        <div class="current-time">{{ currentTime }}</div>
      </div>
    </header>

    <main class="main-content">
      <aside class="left-panel">
        <div class="card stats-card">
          <h3>📊 设备统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">总设备数</span>
              <span class="stat-value">{{ stats.total }}</span>
            </div>
            <div class="stat-item online">
              <span class="stat-label">在线</span>
              <span class="stat-value">{{ stats.online }}</span>
            </div>
            <div class="stat-item offline">
              <span class="stat-label">离线</span>
              <span class="stat-value">{{ stats.offline }}</span>
            </div>
            <div class="stat-item charging">
              <span class="stat-label">充电中</span>
              <span class="stat-value">{{ stats.charging }}</span>
            </div>
            <div class="stat-item error">
              <span class="stat-label">故障</span>
              <span class="stat-value">{{ stats.error }}</span>
            </div>
          </div>
        </div>

        <div class="card power-card">
          <h3>⚡ 实时功率 (kW)</h3>
          <div class="power-value">{{ stats.totalPower.toFixed(1) }}</div>
          <div class="power-subtitle">今日充电量: {{ stats.todayEnergy.toFixed(2) }} kWh</div>
        </div>

        <div class="card revenue-card">
          <h3>💰 营收统计</h3>
          <div class="revenue-grid">
            <div class="revenue-item">
              <span class="label">今日营收</span>
              <span class="value">¥{{ revenue.todayRevenue.toFixed(2) }}</span>
            </div>
            <div class="revenue-item">
              <span class="label">总营收</span>
              <span class="value">¥{{ revenue.totalRevenue.toFixed(2) }}</span>
            </div>
            <div class="revenue-item">
              <span class="label">今日订单</span>
              <span class="value">{{ revenue.todayOrders }}</span>
            </div>
            <div class="revenue-item">
              <span class="label">总订单</span>
              <span class="value">{{ revenue.totalOrders }}</span>
            </div>
          </div>
        </div>

        <div class="card alarm-card">
          <h3>🚨 告警统计</h3>
          <div class="alarm-grid">
            <div class="alarm-item critical">
              <span class="label">严重</span>
              <span class="value">{{ alarmStats.critical }}</span>
            </div>
            <div class="alarm-item warning">
              <span class="label">警告</span>
              <span class="value">{{ alarmStats.warning }}</span>
            </div>
            <div class="alarm-item unresolved">
              <span class="label">未处理</span>
              <span class="value">{{ alarmStats.unresolved }}</span>
            </div>
          </div>
        </div>
      </aside>

      <section class="center-panel">
        <div class="card chart-card">
          <h3>📈 实时功率曲线</h3>
          <div ref="powerChart" class="chart-container"></div>
        </div>

        <div class="card stations-card">
          <h3>🔋 充电桩列表</h3>
          <div class="stations-grid">
            <div 
              v-for="station in stations" 
              :key="station.id"
              class="station-card"
              :class="{ 'selected': selectedStation?.id === station.id }"
              @click="selectStation(station)"
            >
              <div class="station-header">
                <span class="station-name">{{ station.name }}</span>
                <span class="station-status" :class="'status-' + station.status">
                  {{ getStatusText(station.status) }}
                </span>
              </div>
              <div class="station-info">
                <div class="info-row">
                  <span>位置:</span>
                  <span>{{ station.location }}</span>
                </div>
                <div class="info-row">
                  <span>功率:</span>
                  <span>{{ station.currentPower.toFixed(1) }} / {{ station.powerCapacity }} kW</span>
                </div>
                <div class="info-row">
                  <span>电压:</span>
                  <span>{{ station.voltage.toFixed(1) }} V</span>
                </div>
                <div class="info-row">
                  <span>电流:</span>
                  <span>{{ station.current.toFixed(1) }} A</span>
                </div>
                <div class="info-row">
                  <span>温度:</span>
                  <span :class="{ 'temp-high': station.temperature > 50 }">
                    {{ station.temperature.toFixed(1) }} °C
                  </span>
                </div>
              </div>
              <div class="station-actions">
                <button 
                  class="btn btn-success" 
                  :disabled="station.status === 'charging'"
                  @click.stop="handleStart(station)"
                >
                  开始充电
                </button>
                <button 
                  class="btn btn-danger" 
                  :disabled="station.status !== 'charging'"
                  @click.stop="handleStop(station)"
                >
                  停止充电
                </button>
                <button 
                  class="btn btn-primary"
                  @click.stop="handleReset(station)"
                >
                  复位
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="right-panel">
        <div class="card chart-card">
          <h3>📊 设备状态分布</h3>
          <div ref="statusChart" class="chart-container small-chart"></div>
        </div>

        <div class="card chart-card">
          <h3>📊 功率对比</h3>
          <div ref="barChart" class="chart-container small-chart"></div>
        </div>

        <div class="card alarm-list-card">
          <h3>🔔 实时告警</h3>
          <div class="alarm-list">
            <div 
              v-for="alarm in recentAlarms" 
              :key="alarm.id"
              class="alarm-item slide-in"
              :class="'level-' + alarm.alarmLevel"
            >
              <div class="alarm-header">
                <span class="alarm-type">{{ getAlarmTypeText(alarm.alarmType) }}</span>
                <span class="alarm-time">{{ formatTime(alarm.createdAt) }}</span>
              </div>
              <div class="alarm-message">{{ alarm.message }}</div>
              <div class="alarm-station">{{ alarm.stationId }}</div>
            </div>
            <div v-if="recentAlarms.length === 0" class="no-alarms">
              暂无告警信息
            </div>
          </div>
        </div>
      </aside>
    </main>

    <div v-if="showAlarmPopup" class="alarm-popup">
      <div class="popup-content">
        <div class="popup-header">
          <span class="popup-icon">🚨</span>
          <span class="popup-title">系统告警</span>
        </div>
        <div class="popup-body">
          <p><strong>设备:</strong> {{ popupAlarm?.stationId }}</p>
          <p><strong>类型:</strong> {{ getAlarmTypeText(popupAlarm?.alarmType) }}</p>
          <p><strong>级别:</strong> {{ popupAlarm?.alarmLevel === 'critical' ? '严重' : popupAlarm?.alarmLevel === 'warning' ? '警告' : '信息' }}</p>
          <p><strong>描述:</strong> {{ popupAlarm?.message }}</p>
        </div>
        <div class="popup-footer">
          <button class="btn btn-primary" @click="closeAlarmPopup">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { 
  getStations, 
  getStationStats, 
  getRevenueStats, 
  getAlarmStats,
  getAlarms,
  startCharging,
  stopCharging,
  resetStation
} from './api'
import wsManager from './utils/websocket'

const wsConnected = ref(false)
const currentTime = ref('')
const stations = ref([])
const selectedStation = ref(null)
const stats = reactive({
  total: 0,
  online: 0,
  offline: 0,
  charging: 0,
  error: 0,
  totalPower: 0,
  todayEnergy: 0
})
const revenue = reactive({
  todayRevenue: 0,
  totalRevenue: 0,
  todayOrders: 0,
  totalOrders: 0
})
const alarmStats = reactive({
  critical: 0,
  warning: 0,
  unresolved: 0
})
const recentAlarms = ref([])
const showAlarmPopup = ref(false)
const popupAlarm = ref(null)

const powerChart = ref(null)
const statusChart = ref(null)
const barChart = ref(null)

let powerChartInstance = null
let statusChartInstance = null
let barChartInstance = null

const powerHistory = reactive({})
const maxDataPoints = 60

const getStatusText = (status) => {
  const map = {
    'online': '在线',
    'offline': '离线',
    'charging': '充电中',
    'idle': '空闲',
    'error': '故障'
  }
  return map[status] || status
}

const getAlarmTypeText = (type) => {
  const map = {
    'over_temperature': '温度过高',
    'over_voltage': '电压异常',
    'over_current': '电流异常',
    'power_fluctuation': '功率波动',
    'connection_error': '通信异常'
  }
  return map[type] || type
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN')
}

const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const loadData = async () => {
  try {
    const [stationsRes, statsRes, revenueRes, alarmStatsRes, alarmsRes] = await Promise.all([
      getStations(),
      getStationStats(),
      getRevenueStats(),
      getAlarmStats(),
      getAlarms('false')
    ])
    
    if (stationsRes.data.code === 0) {
      stations.value = stationsRes.data.data
      stations.value.forEach(s => {
        if (!powerHistory[s.id]) {
          powerHistory[s.id] = []
        }
      })
    }
    if (statsRes.data.code === 0) {
      Object.assign(stats, statsRes.data.data)
    }
    if (revenueRes.data.code === 0) {
      Object.assign(revenue, revenueRes.data.data)
    }
    if (alarmStatsRes.data.code === 0) {
      Object.assign(alarmStats, alarmStatsRes.data.data)
    }
    if (alarmsRes.data.code === 0) {
      recentAlarms.value = alarmsRes.data.data.slice(0, 10)
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
}

const selectStation = (station) => {
  selectedStation.value = station
}

const handleStart = async (station) => {
  try {
    await startCharging(station.id)
  } catch (e) {
    console.error('Failed to start charging:', e)
  }
}

const handleStop = async (station) => {
  try {
    await stopCharging(station.id)
  } catch (e) {
    console.error('Failed to stop charging:', e)
  }
}

const handleReset = async (station) => {
  try {
    await resetStation(station.id)
  } catch (e) {
    console.error('Failed to reset station:', e)
  }
}

const closeAlarmPopup = () => {
  showAlarmPopup.value = false
  popupAlarm.value = null
}

const initCharts = () => {
  if (powerChart.value) {
    powerChartInstance = echarts.init(powerChart.value)
    updatePowerChart()
  }
  if (statusChart.value) {
    statusChartInstance = echarts.init(statusChart.value)
    updateStatusChart()
  }
  if (barChart.value) {
    barChartInstance = echarts.init(barChart.value)
    updateBarChart()
  }
}

const updatePowerChart = () => {
  if (!powerChartInstance) return
  
  const now = new Date()
  const times = []
  for (let i = maxDataPoints - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 2000)
    times.push(t.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  }

  const series = stations.value.slice(0, 4).map((s, i) => {
    const colors = ['#00aaff', '#00ff88', '#ffcc00', '#ff6600']
    const data = powerHistory[s.id] || []
    while (data.length < maxDataPoints) {
      data.unshift(0)
    }
    if (data.length > maxDataPoints) {
      data.splice(0, data.length - maxDataPoints)
    }
    return {
      name: s.name,
      type: 'line',
      smooth: true,
      data: data,
      lineStyle: { color: colors[i % colors.length] },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors[i % colors.length] + '40' },
          { offset: 1, color: colors[i % colors.length] + '00' }
        ])
      }
    }
  })

  powerChartInstance.setOption({
    tooltip: { trigger: 'axis' },
    legend: { 
      data: stations.value.slice(0, 4).map(s => s.name),
      textStyle: { color: '#fff' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#888' }
    },
    yAxis: {
      type: 'value',
      name: 'kW',
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#888' },
      splitLine: { lineStyle: { color: '#222' } }
    },
    series: series
  })
}

const updateStatusChart = () => {
  if (!statusChartInstance) return

  statusChartInstance.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#1a2a4a',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      labelLine: { show: false },
      data: [
        { value: stats.charging, name: '充电中', itemStyle: { color: '#ffcc00' } },
        { value: stats.online - stats.charging, name: '空闲', itemStyle: { color: '#00aaff' } },
        { value: stats.offline, name: '离线', itemStyle: { color: '#ff4444' } },
        { value: stats.error, name: '故障', itemStyle: { color: '#ff6600' } }
      ]
    }]
  })
}

const updateBarChart = () => {
  if (!barChartInstance) return

  barChartInstance.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: stations.value.map(s => s.id),
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#888' }
    },
    yAxis: {
      type: 'value',
      name: 'kW',
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#888' },
      splitLine: { lineStyle: { color: '#222' } }
    },
    series: [{
      type: 'bar',
      data: stations.value.map(s => ({
        value: s.currentPower,
        itemStyle: {
          color: s.status === 'charging' ? '#00ff88' : '#334'
        }
      })),
      barWidth: '60%'
    }]
  })
}

const onPowerReport = ({ stationId, data }) => {
  const station = stations.value.find(s => s.id === stationId)
  if (station) {
    station.currentPower = data.power
    station.voltage = data.voltage
    station.current = data.current
    station.temperature = data.temperature
    station.status = data.isCharging ? 'charging' : 'idle'

    if (!powerHistory[stationId]) {
      powerHistory[stationId] = []
    }
    powerHistory[stationId].push(data.power)
    if (powerHistory[stationId].length > maxDataPoints) {
      powerHistory[stationId].shift()
    }
  }

  stats.totalPower = stations.value.reduce((sum, s) => sum + s.currentPower, 0)
  
  nextTick(() => {
    updatePowerChart()
    updateBarChart()
  })
}

const onAlarm = ({ stationId, data }) => {
  const alarm = {
    id: Date.now(),
    stationId,
    alarmType: data.alarmType,
    alarmLevel: data.alarmLevel,
    message: data.message,
    createdAt: new Date().toISOString()
  }

  recentAlarms.value.unshift(alarm)
  if (recentAlarms.value.length > 10) {
    recentAlarms.value.pop()
  }

  if (data.alarmLevel === 'critical' || data.alarmLevel === 'warning') {
    popupAlarm.value = alarm
    showAlarmPopup.value = true
  }

  loadData()
}

const onStatusUpdate = ({ stationId, data }) => {
  const station = stations.value.find(s => s.id === stationId)
  if (station) {
    station.status = data.status
    nextTick(() => {
      updateStatusChart()
    })
  }
}

let timeInterval = null
let dataInterval = null

onMounted(() => {
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 1000)
  
  loadData().then(() => {
    nextTick(() => {
      initCharts()
    })
  })

  dataInterval = setInterval(loadData, 30000)

  wsManager.on('connected', () => {
    wsConnected.value = true
  })
  wsManager.on('disconnected', () => {
    wsConnected.value = false
  })
  wsManager.on('powerReport', onPowerReport)
  wsManager.on('alarm', onAlarm)
  wsManager.on('statusUpdate', onStatusUpdate)
  
  wsManager.connect()

  window.addEventListener('resize', () => {
    powerChartInstance?.resize()
    statusChartInstance?.resize()
    barChartInstance?.resize()
  })
})

onUnmounted(() => {
  clearInterval(timeInterval)
  clearInterval(dataInterval)
  wsManager.disconnect()
  powerChartInstance?.dispose()
  statusChartInstance?.dispose()
  barChartInstance?.dispose()
})

watch(stats, () => {
  nextTick(() => {
    updateStatusChart()
  })
}, { deep: true })
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  background: rgba(0, 50, 100, 0.3);
  border-bottom: 1px solid rgba(0, 150, 255, 0.3);
}

.header-left h1 {
  font-size: 24px;
  background: linear-gradient(90deg, #00aaff, #00ff88);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-left .subtitle {
  font-size: 12px;
  color: #666;
  margin-left: 10px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #888;
}

.connection-status.connected {
  color: #00ff88;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #666;
}

.connection-status.connected .status-dot {
  background: #00ff88;
  box-shadow: 0 0 10px #00ff88;
}

.current-time {
  font-size: 14px;
  color: #aaa;
  font-family: monospace;
}

.main-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
}

.left-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.right-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  padding: 20px;
}

.card h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #00aaff;
  border-bottom: 1px solid rgba(0, 150, 255, 0.2);
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.stat-item .stat-label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.stat-item .stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-item.online .stat-value { color: #00ff88; }
.stat-item.offline .stat-value { color: #ff4444; }
.stat-item.charging .stat-value { color: #ffcc00; }
.stat-item.error .stat-value { color: #ff6600; }

.power-card {
  text-align: center;
}

.power-value {
  font-size: 48px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

.power-subtitle {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.revenue-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.revenue-item {
  text-align: center;
}

.revenue-item .label {
  display: block;
  font-size: 12px;
  color: #888;
}

.revenue-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #ffcc00;
}

.alarm-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.alarm-item {
  text-align: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.alarm-item .label {
  display: block;
  font-size: 11px;
  color: #888;
}

.alarm-item .value {
  font-size: 20px;
  font-weight: bold;
}

.alarm-item.critical .value { color: #ff4444; }
.alarm-item.warning .value { color: #ffcc00; }
.alarm-item.unresolved .value { color: #ff6600; }

.chart-container {
  height: 280px;
}

.chart-container.small-chart {
  height: 180px;
}

.stations-card {
  flex: 1;
  min-height: 0;
}

.stations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.station-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 150, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.station-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 150, 255, 0.5);
}

.station-card.selected {
  border-color: #00ff88;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.station-name {
  font-weight: bold;
  font-size: 14px;
}

.station-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.station-info {
  font-size: 12px;
  color: #aaa;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.info-row .temp-high {
  color: #ff4444;
}

.station-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.station-actions .btn {
  flex: 1;
  padding: 6px 8px;
  font-size: 12px;
}

.station-actions .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alarm-list {
  max-height: 300px;
  overflow-y: auto;
}

.alarm-list .alarm-item {
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid #666;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 0 4px 4px 0;
}

.alarm-list .alarm-item.level-critical {
  border-left-color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
}

.alarm-list .alarm-item.level-warning {
  border-left-color: #ffcc00;
  background: rgba(255, 204, 0, 0.1);
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.alarm-type {
  font-weight: bold;
  font-size: 13px;
}

.alarm-time {
  font-size: 11px;
  color: #666;
}

.alarm-message {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 3px;
}

.alarm-station {
  font-size: 11px;
  color: #00aaff;
}

.no-alarms {
  text-align: center;
  color: #666;
  padding: 30px;
}

.alarm-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background: linear-gradient(135deg, #1a2a4a 0%, #0c1929 100%);
  border: 1px solid rgba(255, 68, 68, 0.5);
  border-radius: 12px;
  padding: 25px;
  min-width: 400px;
  box-shadow: 0 0 30px rgba(255, 68, 68, 0.3);
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.popup-icon {
  font-size: 28px;
}

.popup-title {
  font-size: 20px;
  font-weight: bold;
  color: #ff4444;
}

.popup-body p {
  margin: 10px 0;
  color: #ddd;
}

.popup-body strong {
  color: #fff;
}

.popup-footer {
  margin-top: 20px;
  text-align: right;
}
</style>
