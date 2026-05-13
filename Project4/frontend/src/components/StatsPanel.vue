<template>
  <div class="card">
    <h3>📊 系统概览</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="value">{{ statistics.total_devices }}</div>
        <div class="label">设备总数</div>
      </div>
      <div class="stat-item online">
        <div class="value">{{ statistics.online_devices }}</div>
        <div class="label">在线设备</div>
      </div>
      <div class="stat-item warning">
        <div class="value">{{ statistics.warning_devices }}</div>
        <div class="label">告警设备</div>
      </div>
      <div class="stat-item offline">
        <div class="value">{{ statistics.total_alerts }}</div>
        <div class="label">告警次数</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMonitorStore } from '../stores'

const store = useMonitorStore()
const statistics = computed(() => store.statistics)
</script>
