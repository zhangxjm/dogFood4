<template>
  <view class="container">
    <view class="row" style="margin-bottom: 20px;">
      <view class="title" style="margin-bottom: 0;">主人列表</view>
      <view class="btn" style="margin-top: 0; padding: 8px 16px;" @click="addOwner">+ 新增</view>
    </view>
    
    <view v-if="owners.length === 0" class="card" style="text-align: center; padding: 40px;">
      <view style="color: #999;">暂无主人数据</view>
      <view style="color: #999; margin-top: 10px;">点击右上角"新增"添加第一位主人</view>
    </view>
    
    <view v-for="owner in owners" :key="owner.ID" class="card" @click="editOwner(owner)">
      <view class="row">
        <view>
          <view style="font-weight: bold; font-size: 18px;">{{ owner.Name }}</view>
          <view style="color: #666; margin-top: 4px; font-size: 14px;">
            <text v-if="owner.Phone">📞 {{ owner.Phone }}</text>
          </view>
          <view v-if="owner.Address" style="color: #666; margin-top: 4px; font-size: 13px;">
            📍 {{ owner.Address }}
          </view>
        </view>
        <view style="color: #007AFF;">详情 →</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getOwners } from '@/utils/api.js'

export default {
  data() {
    return {
      owners: []
    }
  },
  onShow() {
    this.loadOwners()
  },
  methods: {
    async loadOwners() {
      try {
        const res = await getOwners()
        this.owners = res.data || []
      } catch (e) {
        console.error('加载主人列表失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    addOwner() {
      uni.navigateTo({ url: '/pages/owners/edit' })
    },
    editOwner(owner) {
      uni.navigateTo({ url: `/pages/owners/edit?id=${owner.ID}` })
    }
  }
}
</script>
