<template>
  <div class="container">
    <h1 class="page-title">提醒中心</h1>
    
    <div class="card" style="padding: 0;">
      <div v-for="r in reminders" :key="r.id" class="list-item" @click="markRead(r.id)">
        <div class="flex-between">
          <div>
            <strong>{{ r.member_name }}</strong>
            <span class="text-danger" style="margin-left: 12px; font-size: 12px;">新提醒</span>
          </div>
        </div>
        <p style="margin-top: 8px;">{{ r.message }}</p>
        <span class="text-muted" style="font-size: 12px;">{{ r.created_at }}</span>
      </div>
      
      <div class="list-item" style="background: #fff7e6;">
        <strong style="color: #fa8c16; font-size: 16px;">📢 即将到期会员 ({{ expiringMembers.length }})</strong>
      </div>
      <div v-if="expiringMembers.length === 0" class="empty-state">
        <div class="empty-state-text">暂无即将到期会员 🎉</div>
      </div>
      <div v-for="m in expiringMembers" :key="m.id" class="list-item" @click="goMemberDetail(m.id)">
        <div class="flex-between">
          <div>
            <strong>{{ m.name }}</strong>
            <span class="text-muted" style="margin-left: 12px; font-size: 13px;">{{ m.phone }}</span>
          </div>
          <span class="text-danger">{{ m.end_date }} 到期</span>
        </div>
        <div class="text-muted" style="margin-top: 4px; font-size: 13px;">
          {{ m.card_name }} · {{ m.card_number }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'

export default {
  name: 'Reminders',
  data() {
    return {
      reminders: [],
      expiringMembers: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.reminders = await api.getReminders()
      this.expiringMembers = await api.getExpiringMembers()
    },
    async markRead(id) {
      await api.markReminderRead(id)
      this.loadData()
    },
    goMemberDetail(id) {
      this.$router.push(`/members/${id}`)
    }
  }
}
</script>