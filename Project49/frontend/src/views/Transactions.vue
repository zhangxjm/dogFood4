<template>
  <div class="container">
    <h1 class="page-title">消费记录</h1>
    
    <div class="card" style="padding: 0;">
      <div v-if="transactions.length === 0" class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-text">暂无消费记录</div>
      </div>
      <div v-for="t in transactions" :key="t.id" class="list-item">
        <div class="flex-between">
          <div>
            <strong>{{ t.member_name }}</strong>
            <span class="text-muted" style="margin-left: 12px;">{{ t.card_number || '无卡' }}</span>
          </div>
          <span :class="t.amount >= 0 ? 'text-success' : 'text-danger'" style="font-weight: 500; font-size: 16px;">
            {{ t.amount >= 0 ? '+' : '' }}¥{{ t.amount }}
          </span>
        </div>
        <div style="margin-top: 8px;">
          <span>{{ t.description }}</span>
        </div>
        <div class="flex-between" style="margin-top: 4px;">
          <span class="text-muted" style="font-size: 12px;">{{ t.created_at }}</span>
          <span v-if="t.sessions !== 0" :class="t.sessions > 0 ? 'text-success' : 'text-danger'" style="font-size: 12px;">
            课时: {{ t.sessions > 0 ? '+' : '' }}{{ t.sessions }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'

export default {
  name: 'Transactions',
  data() {
    return {
      transactions: []
    }
  },
  mounted() {
    this.loadTransactions()
  },
  methods: {
    async loadTransactions() {
      this.transactions = await api.getTransactions('')
    }
  }
}
</script>