<template>
  <view class="container">
    <view class="title">{{ isEdit ? '编辑主人' : '新增主人' }}</view>
    
    <view class="card">
      <view class="form-item">
        <text class="form-label">姓名 *</text>
        <input class="form-input" v-model="form.Name" placeholder="请输入姓名" />
      </view>
      
      <view class="form-item">
        <text class="form-label">电话</text>
        <input class="form-input" v-model="form.Phone" placeholder="请输入联系电话" />
      </view>
      
      <view class="form-item">
        <text class="form-label">地址</text>
        <input class="form-input" v-model="form.Address" placeholder="请输入地址" />
      </view>
      
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea class="form-input" v-model="form.Description" placeholder="备注信息" style="height: 80px;"></textarea>
      </view>
    </view>
    
    <view class="btn" @click="saveOwner">{{ isEdit ? '保存修改' : '创建主人' }}</view>
    
    <view v-if="isEdit" class="btn btn-secondary" style="margin-top: 12px; background-color: #ff3b30; color: #fff;" @click="deleteOwner">
      删除主人
    </view>
  </view>
</template>

<script>
import { getOwner, createOwner, updateOwner, deleteOwner } from '@/utils/api.js'

export default {
  data() {
    return {
      id: null,
      isEdit: false,
      form: {
        Name: '',
        Phone: '',
        Address: '',
        Description: ''
      }
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id
      this.isEdit = true
      this.loadOwner()
    }
  },
  methods: {
    async loadOwner() {
      try {
        const res = await getOwner(this.id)
        const owner = res.data
        this.form = {
          Name: owner.Name,
          Phone: owner.Phone || '',
          Address: owner.Address || '',
          Description: owner.Description || ''
        }
      } catch (e) {
        console.error('加载主人信息失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    async saveOwner() {
      if (!this.form.Name) {
        uni.showToast({ title: '请输入姓名', icon: 'none' })
        return
      }
      
      try {
        if (this.isEdit) {
          await updateOwner(this.id, this.form)
          uni.showToast({ title: '保存成功', icon: 'success' })
        } else {
          await createOwner(this.form)
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
    deleteOwner() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这位主人吗？绑定的宠物信息不会被删除。',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteOwner(this.id)
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
