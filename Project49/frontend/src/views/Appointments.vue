<template>
  <div class="container">
    <div class="flex-between">
      <h1 class="page-title">预约管理</h1>
      <button class="btn btn-primary" @click="showAddModal = true">新增预约</button>
    </div>
    
    <div class="card" style="padding: 0;">
      <div v-if="appointments.length === 0" class="empty-state">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-text">暂无预约数据</div>
      </div>
      <div v-for="apt in appointments" :key="apt.id" class="list-item">
        <div class="flex-between">
          <div>
            <strong>{{ apt.member_name }}</strong>
            <span class="text-muted" style="margin-left: 12px;">→ {{ apt.trainer_name }}</span>
          </div>
          <span :class="getStatusClass(apt.status)">
            {{ getStatusText(apt.status) }}
          </span>
        </div>
        <div class="text-muted" style="margin-top: 8px; font-size: 13px;">
          📅 {{ apt.appointment_date }} · ⏰ {{ apt.start_time }}-{{ apt.end_time }}
          <span v-if="apt.session_deducted" class="text-success" style="margin-left: 12px;">✓ 课时已扣减</span>
        </div>
        <div class="flex" style="margin-top: 12px; gap: 8px;">
          <button v-if="apt.status === 'pending'" class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;" @click="confirmApt(apt.id)">确认</button>
          <button v-if="apt.status === 'confirmed'" class="btn btn-success" style="padding: 6px 12px; font-size: 12px;" @click="completeApt(apt.id)">完成</button>
          <button v-if="apt.status !== 'completed' && apt.status !== 'cancelled'" class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" @click="cancelApt(apt.id)">取消</button>
        </div>
      </div>
    </div>
    
    <div v-if="showAddModal" class="modal-mask" @click.self="showAddModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">新增预约</span>
          <button class="modal-close" @click="showAddModal = false">×</button>
        </div>
        <div class="form-item">
          <label class="form-label">选择会员</label>
          <select class="form-select" v-model="selectedMemberId">
            <option value="">请选择会员</option>
            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }} - {{ m.phone }}</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">选择会员卡</label>
          <select class="form-select" v-model="selectedCardId">
            <option value="">请选择会员卡</option>
            <option v-for="c in memberCards" :key="c.id" :value="c.id">
              {{ c.card_type_name }} - 剩余{{ c.remaining_sessions }}课时
            </option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">选择教练</label>
          <select class="form-select" v-model="selectedTrainerId">
            <option value="">请选择教练</option>
            <option v-for="t in trainers" :key="t.id" :value="t.id">{{ t.name }} - {{ t.specialty }}</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">预约日期</label>
          <input class="form-input" type="date" v-model="form.appointment_date" />
        </div>
        <div class="form-item">
          <label class="form-label">开始时间</label>
          <input class="form-input" type="time" v-model="form.start_time" />
        </div>
        <div class="form-item">
          <label class="form-label">结束时间</label>
          <input class="form-input" type="time" v-model="form.end_time" />
        </div>
        <button class="btn btn-primary" style="width: 100%;" @click="addAppointment">确认预约</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'

export default {
  name: 'Appointments',
  data() {
    return {
      appointments: [],
      members: [],
      trainers: [],
      memberCards: [],
      showAddModal: false,
      selectedMemberId: '',
      selectedCardId: '',
      selectedTrainerId: '',
      form: {
        appointment_date: '',
        start_time: '',
        end_time: ''
      }
    }
  },
  mounted() {
    this.loadData()
    if (this.$route.query.action === 'add') {
      this.showAddModal = true
    }
  },
  watch: {
    selectedMemberId(newVal) {
      if (newVal) {
        this.loadMemberCards(newVal)
      } else {
        this.memberCards = []
      }
    }
  },
  methods: {
    async loadData() {
      this.appointments = await api.getAppointments()
      this.members = await api.getMembers()
      this.trainers = await api.getTrainers()
    },
    async loadMemberCards(memberId) {
      const member = await api.getMember(memberId)
      this.memberCards = member.cards.filter(c => c.status === 'active' && c.remaining_sessions > 0)
    },
    getStatusText(status) {
      const map = { pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' }
      return map[status] || status
    },
    getStatusClass(status) {
      const map = { pending: 'tag tag-pending', confirmed: 'tag tag-confirmed', completed: 'tag tag-completed', cancelled: 'tag tag-cancelled' }
      return map[status] || ''
    },
    async addAppointment() {
      if (!this.selectedMemberId || !this.selectedCardId || !this.selectedTrainerId || !this.form.appointment_date || !this.form.start_time || !this.form.end_time) {
        alert('请填写完整信息')
        return
      }
      try {
        await api.addAppointment({
          member_id: this.selectedMemberId,
          member_card_id: this.selectedCardId,
          trainer_id: this.selectedTrainerId,
          ...this.form
        })
        alert('预约成功')
        this.showAddModal = false
        this.selectedMemberId = ''
        this.selectedCardId = ''
        this.selectedTrainerId = ''
        this.form = { appointment_date: '', start_time: '', end_time: '' }
        this.loadData()
      } catch (e) {
        alert(e.message)
      }
    },
    async confirmApt(id) {
      await api.confirmAppointment(id)
      alert('确认成功')
      this.loadData()
    },
    async completeApt(id) {
      await api.completeAppointment(id)
      alert('完成成功，课时已扣减')
      this.loadData()
    },
    async cancelApt(id) {
      await api.cancelAppointment(id)
      alert('取消成功')
      this.loadData()
    }
  }
}
</script>