<template>
  <div class="card">
    <h3>📱 设备列表</h3>
    <div class="device-list">
      <div
        v-for="device in devices"
        :key="device.id"
        :class="['device-item', { selected: selectedDevice?.id === device.id }]"
        @click="selectDevice(device)"
      >
        <div class="device-name">{{ device.name }}</div>
        <div class="device-status">
          <span :class="['status-dot', device.status, { pulse: device.status === 'warning' }]"></span>
          <span>{{ statusText(device.status) }}</span>
          <span v-if="device.status === 'online'">
            {{ device.temperature?.toFixed(1) }}°C
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMonitorStore } from '../stores'

const store = useMonitorStore()
const devices = computed(() => store.devices)
const selectedDevice = computed(() => store.selectedDevice)

const selectDevice = (device) => {
  store.selectDevice(device)
}

const statusText = (status) => {
  const map = {
    online: '在线',
    offline: '离线',
    warning: '告警'
  }
  return map[status] || status
}
</script>
