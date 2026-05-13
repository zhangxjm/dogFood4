<template>
  <view class="container">
    <view class="title">{{ isEdit ? '编辑宠物' : '新增宠物' }}</view>
    
    <view class="card">
      <view class="form-item">
        <text class="form-label">宠物名称 *</text>
        <input class="form-input" v-model="form.Name" placeholder="请输入宠物名称" />
      </view>
      
      <view class="form-item">
        <text class="form-label">宠物类型 *</text>
        <input class="form-input" v-model="form.Type" placeholder="例如：狗、猫、鸟等" />
      </view>
      
      <view class="form-item">
        <text class="form-label">品种</text>
        <input class="form-input" v-model="form.Breed" placeholder="例如：金毛、布偶等" />
      </view>
      
      <view class="form-item">
        <text class="form-label">性别</text>
        <picker :range="['公', '母']" @change="onGenderChange">
          <view class="form-input">{{ form.Gender || '请选择性别' }}</view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">出生日期</text>
        <picker mode="date" @change="onDateChange">
          <view class="form-input">{{ form.BirthDate || '请选择日期' }}</view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">绑定主人</text>
        <picker :range="ownerNames" :value="ownerIndex" @change="onOwnerChange">
          <view class="form-input">{{ ownerIndex >= 0 ? ownerNames[ownerIndex] : '请选择主人（可选）' }}</view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea class="form-input" v-model="form.Description" placeholder="备注信息" style="height: 80px;"></textarea>
      </view>
    </view>
    
    <view class="btn" @click="savePet">{{ isEdit ? '保存修改' : '创建宠物' }}</view>
    
    <view v-if="isEdit" class="btn btn-secondary" style="margin-top: 12px;" @click="goToVaccines">
      疫苗记录管理
    </view>
    
    <view v-if="isEdit" class="btn btn-secondary" style="margin-top: 12px; background-color: #ff3b30; color: #fff;" @click="deletePet">
      删除宠物
    </view>
  </view>
</template>

<script>
import { getPet, createPet, updatePet, deletePet, getOwners } from '@/utils/api.js'

export default {
  data() {
    return {
      id: null,
      isEdit: false,
      form: {
        Name: '',
        Type: '',
        Breed: '',
        Gender: '',
        BirthDate: '',
        OwnerID: 0,
        Description: ''
      },
      owners: [],
      ownerIndex: -1
    }
  },
  computed: {
    ownerNames() {
      return this.owners.map(o => o.Name + ' - ' + (o.Phone || '无电话'))
    }
  },
  onLoad(options) {
    this.loadOwners()
    if (options.id) {
      this.id = options.id
      this.isEdit = true
      this.loadPet()
    }
  },
  methods: {
    async loadOwners() {
      try {
        const res = await getOwners()
        this.owners = res.data || []
      } catch (e) {
        console.error('加载主人列表失败', e)
      }
    },
    async loadPet() {
      try {
        const res = await getPet(this.id)
        const pet = res.data
        this.form = {
          Name: pet.Name,
          Type: pet.Type,
          Breed: pet.Breed || '',
          Gender: pet.Gender || '',
          BirthDate: pet.BirthDate || '',
          OwnerID: pet.OwnerID || 0,
          Description: pet.Description || ''
        }
        if (pet.OwnerID) {
          this.ownerIndex = this.owners.findIndex(o => o.ID === pet.OwnerID)
        }
      } catch (e) {
        console.error('加载宠物信息失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    onGenderChange(e) {
      this.form.Gender = ['公', '母'][e.detail.value]
    },
    onDateChange(e) {
      this.form.BirthDate = e.detail.value
    },
    onOwnerChange(e) {
      this.ownerIndex = e.detail.value
      this.form.OwnerID = this.owners[e.detail.value].ID
    },
    async savePet() {
      if (!this.form.Name) {
        uni.showToast({ title: '请输入宠物名称', icon: 'none' })
        return
      }
      if (!this.form.Type) {
        uni.showToast({ title: '请输入宠物类型', icon: 'none' })
        return
      }
      
      try {
        if (this.isEdit) {
          await updatePet(this.id, this.form)
          uni.showToast({ title: '保存成功', icon: 'success' })
        } else {
          await createPet(this.form)
          uni.showToast({ title: '创建成功', icon: 'success' })
        }
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      } catch (e) {
        console.error('保存失败', e)
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    goToVaccines() {
      uni.navigateTo({ url: `/pages/vaccines/vaccines?pet_id=${this.id}` })
    },
    deletePet() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这只宠物吗？相关疫苗记录也会受到影响。',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deletePet(this.id)
              uni.showToast({ title: '删除成功', icon: 'success' })
              setTimeout(() => {
                uni.navigateBack()
              }, 1000)
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
