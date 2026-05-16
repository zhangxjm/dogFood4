<template>
  <div class="container">
    <button class="btn btn-default mb-20" @click="$router.back()">← 返回</button>
    
    <div class="card">
      <div class="member-info">
        <div class="member-avatar">{{ member.name ? member.name[0] : '?' }}</div>
        <div class="member-detail">
          <h3>{{ member.name || '加载中...' }}</h3>
          <p>{{ member.phone }}</p>
          <p v-if="member.gender">{{ member.gender }} · {{ member.birthday || '未填写生日' }}</p>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="flex-between mb-20">
        <h3 style="font-size: 18px;">会员卡</h3>
        <button class="btn btn-success" @click="showBuyCardModal = true">💳 办卡</button>
      </div>
      <div v-if="!member.cards || member.cards.length === 0" class="empty-state">
        <div class="empty-state-icon">💳</div>
        <div class="empty-state-text">暂无会员卡</div>
      </div>
      <div v-for="card in member.cards" :key="card.id" class="list-item">
        <div class="flex-between">
          <div>
            <strong>{{ card.card_type_name }}</strong>
            <span class="text-muted" style="margin-left: 12px;">{{ card.card_number }}</span>
          </div>
          <span :class="card.status === 'active' ? 'tag tag-confirmed' : 'tag tag-cancelled'">
            {{ card.status === 'active' ? '有效' : '已过期' }}
          </span>
        </div>
        <div class="flex-between" style="margin-top: 12px;">
          <div class="text-muted" style="font-size: 13px;">
            剩余课时: {{ card.remaining_sessions }} · 有效期: {{ card.start_date }} 至 {{ card.end_date }}
          </div>
          <button class="btn btn-warning" style="padding: 6px 12px; font-size: 12px;" @click="openRechargeModal(card)">充值</button>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="flex-between mb-20">
        <h3 style="font-size: 18px;">消费记录</h3>
      </div>
      <div v-if="transactions.length === 0" class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-text">暂无消费记录</div>
      </div>
      <div v-for="t in transactions" :key="t.id" class="list-item">
        <div class="flex-between">
          <span>{{ t.description }}</span>
          <span :class="t.amount >= 0 ? 'text-success' : 'text-danger'" style="font-weight: 500;">
            {{ t.amount >= 0 ? '+' : '' }}¥{{ t.amount }}
          </span>
        </div>
        <div class="flex-between" style="margin-top: 4px;">
          <span class="text-muted" style="font-size: 12px;">{{ t.created_at }}</span>
          <span v-if="t.sessions !== 0" :class="t.sessions > 0 ? 'text-success' : 'text-danger'" style="font-size: 12px;">
            课时: {{ t.sessions > 0 ? '+' : '' }}{{ t.sessions }}
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="showBuyCardModal" class="modal-mask" @click.self="showBuyCardModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">选择会员卡类型</span>
          <button class="modal-close" @click="showBuyCardModal = false">×</button>
        </div>
        <div v-for="ct in cardTypes" :key="ct.id" class="list-item" @click="buyCard(ct.id)">
          <div class="flex-between">
            <div>
              <strong>{{ ct.name }}</strong>
              <p class="text-muted" style="margin-top: 4px; font-size: 13px;">{{ ct.description }}</p>
            </div>
            <span style="color: #fa8c16; font-weight: 500;">¥{{ ct.price }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showRechargeModal" class="modal-mask" @click.self="showRechargeModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">会员卡充值</span>
          <button class="modal-close" @click="showRechargeModal = false">×</button>
        </div>
        <div class="form-item">
          <label class="form-label">充值金额</label>
          <input class="form-input" type="number" v-model="rechargeForm.amount" placeholder="请输入金额" />
        </div>
        <div class="form-item">
          <label class="form-label">赠送课时</label>
          <input class="form-input" type="number" v-model="rechargeForm.sessions" placeholder="请输入课时数" />
        </div>
        <button class="btn btn-success" style="width: 100%;" @click="doRecharge">确认充值</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'

export default {
  name: 'MemberDetail',
  data() {
    return {
      member: {},
      transactions: [],
      cardTypes: [],
      showBuyCardModal: false,
      showRechargeModal: false,
      rechargeForm: {
        cardId: null,
        amount: 0,
        sessions: 0
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      const memberId = this.$route.params.id
      this.member = await api.getMember(memberId)
      this.transactions = await api.getTransactions(memberId)
      this.cardTypes = await api.getCardTypes()
    },
    async buyCard(cardTypeId) {
      await api.buyCard(this.member.id, cardTypeId)
      alert('办卡成功')
      this.showBuyCardModal = false
      this.loadData()
    },
    openRechargeModal(card) {
      this.rechargeForm.cardId = card.id
      this.rechargeForm.amount = 0
      this.rechargeForm.sessions = 0
      this.showRechargeModal = true
    },
    async doRecharge() {
      if (!this.rechargeForm.amount && !this.rechargeForm.sessions) {
        alert('请输入充值金额或课时')
        return
      }
      await api.recharge(this.member.id, this.rechargeForm.cardId, this.rechargeForm.amount, this.rechargeForm.sessions)
      alert('充值成功')
      this.showRechargeModal = false
      this.loadData()
    }
  }
}
</script>