<template>
  <view class="container">
    <view class="row" style="margin-bottom: 20px;">
      <view class="title" style="margin-bottom: 0;">疫苗记录</view>
      <view class="btn" style="margin-top: 0; padding: 8px 16px;" @click="showAdd = true">+ 新增</view>
    </view>
    
    <view v-if="vaccines.length === 0" class="card" style="text-align: center; padding: 40px;">
      <view style="color: #999;">暂无疫苗记录</view>
    </view>
    
    <view v-for="vaccine in vaccines" :key="vaccine.ID" class="card">
      <view class="row">
        <view>
          <view style="font-weight: bold; font-size: 18px;">{{ vaccine.Name }}</view>
          <view style="color: #666; margin-top: 4px; font-size: 14px;">
            📅 {{ vaccine.VaccineDate }}
          </view>
          <view v-if="vaccine.Description" style="color: #666; margin-top: 4px; font-size: 13px;">
            {{ vaccine.Description }}
          </view>
        </view>
        <view class="btn btn-secondary" style="margin-top: 0; padding: 6px 12px; font-size: 12px;" @click="deleteVaccine(vaccine)">
          删除
        </view>
      </view>
    </view>
    
    <view v-if="showAdd" class="card" style="position: fixed; bottom: 0; left: 0; right: 0; margin: 0; border-radius: 16px 16px 0 0; z-index: 100;">
      <view class="row" style="margin-bottom: 16px;">
        <view style="font-weight: bold;">新增疫苗记录</view>
        <view @click="showAdd = false" style="color: #999;">✕</view>
      </view>
      
      <view class="form-item">
        <text class="form-label">疫苗名称 *</text>
        <input class="form-input" v-model="newVaccine.Name" placeholder="例如：狂犬疫苗" />
      </view>
      
      <view class="form-item">
        <text class="form-label">接种日期 *</text>
        <picker mode="date" @change="onVaccineDateChange">
          <view class="form-input">{{ newVaccine.VaccineDate || '请选择日期' }}</view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">备注</text>
        <input class="form-input" v-model="newVaccine.Description" placeholder="备注信息" />
      </view>
      
      <view class="btn" @click="addVaccine">保存</view>
    </view>
  </view>
</template>

<script>
import { getVaccines, createVaccine, deleteVaccine } from '@/utils/api.js'

export default {
  data() {
    return {
      petId: null,
      vaccines: [],
      showAdd: false,
      newVaccine: {
        Name: '',
        VaccineDate: '',
        Description: ''
      }
    }
  },
  onLoad(options) {
    if (options.pet_id) {
      this.petId = options.pet_id
      this.loadVaccines()
    }
  },
  methods: {
    async loadVaccines() {
      try {
        const res = await getVaccines(this.petId)
        this.vaccines = res.data || []
      } catch (e) {
        console.error('加载疫苗记录失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    onVaccineDateChange(e) {
      this.newVaccine.VaccineDate = e.detail.value
    },
    async addVaccine() {
      if (!this.newVaccine.Name) {
        uni.showToast({ title: '请输入疫苗名称', icon: 'none' })
        return
      }
      if (!this.newVaccine.VaccineDate) {
        uni.showToast({ title: '请选择接种日期', icon: 'none' })
        return
      }
      
      try {
        const data = {
          ...this.newVaccine,
          PetID: parseInt(this.petId)
        }
        await createVaccine(data)
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.showAdd = false
        this.newVaccine = { Name: '', VaccineDate: '', Description: '' }
        this.loadVaccines()
      } catch (e) {
        console.error('添加失败', e)
        uni.showToast({ title: '添加失败', icon: 'none' })
      }
    },
    deleteVaccine(vaccine) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除疫苗记录「${vaccine.Name}」吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteVaccine(vaccine.ID)
              uni.showToast({ title: '删除成功', icon: 'success' })
              this.loadVaccines()
            } catch (e) {
              console.error('删除失败', e)
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    }
  }
}
</script>
