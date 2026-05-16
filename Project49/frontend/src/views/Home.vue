<template>
  <div class="container">
    <h1 class="page-title">数据概览</h1>
    
    <div class="grid-3">
      <div class="card stat-card">
        <div class="stat-value text-primary">¥{{ stats.total_revenue || 0 }}</div>
        <div class="stat-label">总收入</div>
      </div>
      <div class="card stat-card">
        <div class="stat-value text-success">{{ stats.total_members || 0 }}</div>
        <div class="stat-label">会员总数</div>
      </div>
      <div class="card stat-card">
        <div class="stat-value text-warning">{{ stats.today_appointments || 0 }}</div>
        <div class="stat-label">今日预约</div>
      </div>
    </div>
    
    <div class="card">
      <div class="flex-between mb-20">
        <h3 style="font-size: 18px;">快捷操作</h3>
      </div>
      <div class="flex" style="gap: 12px;">
        <button class="btn btn-primary" @click="goAddMember">➕ 新增会员</button>
        <button class="btn btn-success" @click="goAppointment">📅 新增预约</button>
      </div>
    </div>
    
    <div class="card">
      <div class="flex-between mb-20">
        <h3 style="font-size: 18px;">即将到期会员</h3>
      </div>
      <div v-if="expiringMembers.length === 0" class="empty-state">
        <div class="empty-state-icon">🎉</div>
        <div class="empty-state-text">暂无即将到期会员</div>
      </div>
      <div v-for="member in expiringMembers" :key="member.id" class="list-item" @click="goMemberDetail(member.id)">
        <div class="flex-between">
          <div>
            <strong>{{ member.name }}</strong>
            <span class="text-muted" style="margin-left: 12px;">{{ member.card_number }}</span>
          </div>
          <span class="text-danger">{{ member.end_date }} 到期</span>
        </div>
        <div class="text-muted" style="margin-top: 8px; font-size: 13px;">
          {{ member.card_name }} · {{ member.phone }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'

export default {
  name: 'Home',
  data() {
    return {
      stats: {},
      expiringMembers: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        this.stats = await api.getStats()
        this.expiringMembers = await api.getExpiringMembers()
      } catch (e) {
        console.error(e)
      }
    },
    goAddMember() {
      this.$router.push('/members?action=add')
    },
    goAppointment() {
      this.$router.push('/appointments?action=add')
    },
    goMemberDetail(id) {
      this.$router.push(`/members/${id}`)
    }
  }
}
</script>