<template>
  <div class="container">
    <div class="flex-between">
      <h1 class="page-title">会员管理</h1>
      <button class="btn btn-primary" @click="showAddModal = true">新增会员</button>
    </div>
    
    <div class="card" style="padding: 0;">
      <div v-if="members.length === 0" class="empty-state">
        <div class="empty-state-icon">👥</div>
        <div class="empty-state-text">暂无会员数据</div>
      </div>
      <div v-for="member in members" :key="member.id" class="list-item" @click="goDetail(member.id)">
        <div class="flex-between">
          <div>
            <strong>{{ member.name }}</strong>
            <span class="text-muted" style="margin-left: 12px;">{{ member.phone }}</span>
          </div>
          <span class="text-muted">›</span>
        </div>
        <div v-if="member.gender" class="text-muted" style="margin-top: 4px; font-size: 13px;">
          {{ member.gender }} · {{ member.birthday || '未填写生日' }}
        </div>
      </div>
    </div>
    
    <div v-if="showAddModal" class="modal-mask" @click.self="showAddModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">新增会员</span>
          <button class="modal-close" @click="showAddModal = false">×</button>
        </div>
        <div class="form-item">
          <label class="form-label">姓名</label>
          <input class="form-input" v-model="form.name" placeholder="请输入姓名" />
        </div>
        <div class="form-item">
          <label class="form-label">手机号</label>
          <input class="form-input" v-model="form.phone" placeholder="请输入手机号" />
        </div>
        <div class="form-item">
          <label class="form-label">性别</label>
          <select class="form-select" v-model="form.gender">
            <option value="">请选择性别</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">生日</label>
          <input class="form-input" type="date" v-model="form.birthday" />
        </div>
        <button class="btn btn-primary" style="width: 100%;" @click="saveMember">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'

export default {
  name: 'Members',
  data() {
    return {
      members: [],
      showAddModal: false,
      form: {
        name: '',
        phone: '',
        gender: '',
        birthday: ''
      }
    }
  },
  mounted() {
    this.loadMembers()
    if (this.$route.query.action === 'add') {
      this.showAddModal = true
    }
  },
  methods: {
    async loadMembers() {
      this.members = await api.getMembers()
    },
    goDetail(id) {
      this.$router.push(`/members/${id}`)
    },
    async saveMember() {
      if (!this.form.name || !this.form.phone) {
        alert('请填写完整信息')
        return
      }
      await api.addMember(this.form)
      alert('添加成功')
      this.showAddModal = false
      this.form = { name: '', phone: '', gender: '', birthday: '' }
      this.loadMembers()
    }
  }
}
</script>