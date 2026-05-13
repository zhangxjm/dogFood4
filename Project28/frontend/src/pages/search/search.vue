<template>
  <view class="container">
    <view class="title">信息查询</view>
    
    <view class="card">
      <view class="form-item">
        <input class="form-input" v-model="keyword" placeholder="输入宠物名称、品种或主人姓名搜索" confirm-type="search" @confirm="search" />
      </view>
      <view class="btn" @click="search">搜索</view>
    </view>
    
    <view v-if="!hasSearched" class="card" style="text-align: center; padding: 40px;">
      <view style="color: #999;">输入关键词开始搜索</view>
    </view>
    
    <view v-else-if="results.length === 0" class="card" style="text-align: center; padding: 40px;">
      <view style="color: #999;">未找到匹配的结果</view>
    </view>
    
    <view v-for="pet in results" :key="pet.ID" class="card">
      <view class="row">
        <view>
          <view style="font-weight: bold; font-size: 18px;">{{ pet.Name }}</view>
          <view style="color: #666; margin-top: 4px;">
            <text class="tag">{{ pet.Type }}</text>
            <text v-if="pet.Breed" class="tag">{{ pet.Breed }}</text>
            <text v-if="pet.Gender" class="tag">{{ pet.Gender }}</text>
          </view>
          <view v-if="pet.Owner" style="color: #666; margin-top: 8px; font-size: 14px;">
            👤 {{ pet.Owner.Name }}
            <text v-if="pet.Owner.Phone"> | 📞 {{ pet.Owner.Phone }}</text>
          </view>
          <view v-if="pet.BirthDate" style="color: #666; margin-top: 4px; font-size: 13px;">
            📅 生日：{{ pet.BirthDate }}
          </view>
        </view>
        <view class="btn btn-secondary" style="margin-top: 0; padding: 6px 12px; font-size: 12px;" @click="viewPet(pet)">
          详情
        </view>
      </view>
      
      <view v-if="pet.Vaccines && pet.Vaccines.length > 0" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">
        <view style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">💉 疫苗记录 ({{ pet.Vaccines.length }}条)</view>
        <view v-for="vac in pet.Vaccines" :key="vac.ID" style="font-size: 13px; color: #666; margin-bottom: 4px;">
          • {{ vac.Name }} ({{ vac.VaccineDate }})
          <text v-if="vac.Description"> - {{ vac.Description }}</text>
        </view>
      </view>
      
      <view v-if="pet.Description" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">
        <view style="font-size: 13px; color: #888;">📝 {{ pet.Description }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { searchPets } from '@/utils/api.js'

export default {
  data() {
    return {
      keyword: '',
      results: [],
      hasSearched: false
    }
  },
  methods: {
    async search() {
      if (!this.keyword.trim()) {
        uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
        return
      }
      
      try {
        this.hasSearched = true
        const res = await searchPets(this.keyword.trim())
        this.results = res.data || []
      } catch (e) {
        console.error('搜索失败', e)
        uni.showToast({ title: '搜索失败', icon: 'none' })
      }
    },
    viewPet(pet) {
      uni.navigateTo({ url: `/pages/pets/edit?id=${pet.ID}` })
    }
  }
}
</script>
