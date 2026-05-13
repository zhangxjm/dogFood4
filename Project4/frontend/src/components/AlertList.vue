<template>
  <div class="card">
    <h3>⚠️ 告警通知</h3>
    <div class="alert-list">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        :class="['alert-item', alert.level === 'warning' ? 'warning' : '']"
      >
        <div class="alert-header">
          <span class="alert-device">{{ alert.device_name }}</span>
          <span class="alert-level">{{ alert.level === 'critical' ? '严重' : '警告' }}</span>
        </div>
        <div class="alert-message">{{ alert.message }}</div>
        <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
      </div>
      <div v-if="alerts.length === 0" style="text-align: center; color: rgba(255,255,255,0.4); padding: 20px;">
        暂无告警信息
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMonitorStore } from '../stores'

const store = useMonitorStore()
const alerts = computed(() => store.alerts)

const formatTime = (timestamp) => {
  const t = new Date(timestamp)
  return `${t.getMonth() + 1}/${t.getDate()} ${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`
}
</script>
