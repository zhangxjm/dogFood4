<template>
  <div v-if="device" class="card">
    <h3>🔍 设备详情</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 15px;">
      <div style="background: rgba(79, 195, 247, 0.1); padding: 12px; border-radius: 8px; text-align: center; border: 1px solid rgba(79, 195, 247, 0.2);">
        <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">温度</div>
        <div style="font-size: 20px; font-weight: bold; color: #4fc3f7;">{{ device.temperature?.toFixed(1) }}°C</div>
      </div>
      <div style="background: rgba(129, 199, 132, 0.1); padding: 12px; border-radius: 8px; text-align: center; border: 1px solid rgba(129, 199, 132, 0.2);">
        <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">湿度</div>
        <div style="font-size: 20px; font-weight: bold; color: #81c784;">{{ device.humidity?.toFixed(1) }}%</div>
      </div>
      <div style="background: rgba(255, 193, 7, 0.1); padding: 12px; border-radius: 8px; text-align: center; border: 1px solid rgba(255, 193, 7, 0.2);">
        <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">气压</div>
        <div style="font-size: 20px; font-weight: bold; color: #ffc107;">{{ device.pressure?.toFixed(0) }} hPa</div>
      </div>
    </div>
    <div style="font-size: 12px; color: rgba(255,255,255,0.5);">
      <div>设备ID: {{ device.id?.slice(0, 8) }}...</div>
      <div>类型: {{ device.type }}</div>
      <div>最后更新: {{ formatLastSeen(device.last_seen) }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  device: { type: Object, default: null }
})

const formatLastSeen = (time) => {
  if (!time) return '-'
  const t = new Date(time)
  return `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`
}
</script>
