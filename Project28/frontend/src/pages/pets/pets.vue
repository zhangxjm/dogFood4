<template>
  <view class="container">
    <view class="row" style="margin-bottom: 20px;">
      <view class="title" style="margin-bottom: 0;">宠物列表</view>
      <view class="btn" style="margin-top: 0; padding: 8px 16px;" @click="addPet">+ 新增</view>
    </view>
    
    <view v-if="pets.length === 0" class="card" style="text-align: center; padding: 40px;">
      <view style="color: #999;">暂无宠物数据</view>
      <view style="color: #999; margin-top: 10px;">点击右上角"新增"添加第一只宠物</view>
    </view>
    
    <view v-for="pet in pets" :key="pet.ID" class="card" @click="editPet(pet)">
      <view class="row">
        <view>
          <view style="font-weight: bold; font-size: 18px;">{{ pet.Name }}</view>
          <view style="color: #666; margin-top: 4px;">
            <text class="tag">{{ pet.Type }}</text>
            <text v-if="pet.Breed" class="tag">{{ pet.Breed }}</text>
          </view>
          <view v-if="pet.Owner" style="color: #666; margin-top: 8px; font-size: 14px;">
            主人：{{ pet.Owner.Name }}
          </view>
        </view>
        <view style="color: #007AFF;">详情 →</view>
      </view>
      <view v-if="pet.Vaccines && pet.Vaccines.length > 0" style="margin-top: 12px;">
        <view style="font-size: 13px; color: #888;">
          疫苗记录：{{ pet.Vaccines.length }} 条
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPets } from '@/utils/api.js'

export default {
  data() {
    return {
      pets: []
    }
  },
  onShow() {
    this.loadPets()
  },
  methods: {
    async loadPets() {
      try {
        const res = await getPets()
        this.pets = res.data || []
      } catch (e) {
        console.error('加载宠物列表失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    addPet() {
      uni.navigateTo({ url: '/pages/pets/edit' })
    },
    editPet(pet) {
      uni.navigateTo({ url: `/pages/pets/edit?id=${pet.ID}` })
    }
  }
}
</script>
