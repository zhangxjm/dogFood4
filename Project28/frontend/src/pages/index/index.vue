<template>
  <view class="container">
    <view class="title">宠物店管理系统</view>
    <view class="subtitle">基础档案登记</view>
    
    <view class="card">
      <view class="row" style="margin-bottom: 20px;">
        <view class="stat-card">
          <view class="stat-number">{{ stats.pets }}</view>
          <view class="stat-label">宠物总数</view>
        </view>
        <view class="stat-card">
          <view class="stat-number">{{ stats.owners }}</view>
          <view class="stat-label">主人总数</view>
        </view>
        <view class="stat-card">
          <view class="stat-number">{{ stats.vaccines }}</view>
          <view class="stat-label">疫苗记录</view>
        </view>
      </view>
    </view>
    
    <view class="card" @click="goToPets">
      <view class="row">
        <view>
          <view style="font-weight: bold; font-size: 18px;">宠物管理</view>
          <view class="subtitle" style="margin-bottom: 0;">登记宠物信息</view>
        </view>
        <view style="color: #007AFF;">→</view>
      </view>
    </view>
    
    <view class="card" @click="goToOwners">
      <view class="row">
        <view>
          <view style="font-weight: bold; font-size: 18px;">主人管理</view>
          <view class="subtitle" style="margin-bottom: 0;">绑定宠物主人</view>
        </view>
        <view style="color: #007AFF;">→</view>
      </view>
    </view>
    
    <view class="card" @click="goToSearch">
      <view class="row">
        <view>
          <view style="font-weight: bold; font-size: 18px;">信息查询</view>
          <view class="subtitle" style="margin-bottom: 0;">搜索宠物档案</view>
        </view>
        <view style="color: #007AFF;">→</view>
      </view>
    </view>
    
    <view class="card" @click="addNewPet">
      <view class="row">
        <view>
          <view style="font-weight: bold; font-size: 18px;">快速登记</view>
          <view class="subtitle" style="margin-bottom: 0;">新增宠物信息</view>
        </view>
        <view style="color: #007AFF;">+</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPets, getOwners, getVaccines } from '@/utils/api.js'

export default {
  data() {
    return {
      stats: {
        pets: 0,
        owners: 0,
        vaccines: 0
      }
    }
  },
  onShow() {
    this.loadStats()
  },
  methods: {
    async loadStats() {
      try {
        const petsRes = await getPets()
        const ownersRes = await getOwners()
        const vaccinesRes = await getVaccines()
        
        this.stats.pets = petsRes.data ? petsRes.data.length : 0
        this.stats.owners = ownersRes.data ? ownersRes.data.length : 0
        this.stats.vaccines = vaccinesRes.data ? vaccinesRes.data.length : 0
      } catch (e) {
        console.error('加载统计数据失败', e)
      }
    },
    goToPets() {
      uni.switchTab({ url: '/pages/pets/pets' })
    },
    goToOwners() {
      uni.switchTab({ url: '/pages/owners/owners' })
    },
    goToSearch() {
      uni.switchTab({ url: '/pages/search/search' })
    },
    addNewPet() {
      uni.navigateTo({ url: '/pages/pets/edit' })
    }
  }
}
</script>
