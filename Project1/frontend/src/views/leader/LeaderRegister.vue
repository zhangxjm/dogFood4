<template>
  <div class="leader-register-page">
    <van-nav-bar title="成为团长" left-arrow @click-left="router.back()" />
    
    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.community_name"
          name="community_name"
          label="小区名称"
          placeholder="请输入小区名称"
          :rules="[{ required: true, message: '请输入小区名称' }]"
        />
        <van-field
          v-model="form.address"
          name="address"
          label="详细地址"
          placeholder="请输入详细地址"
          :rules="[{ required: true, message: '请输入详细地址' }]"
        />
        <van-field
          v-model="form.phone"
          name="phone"
          label="联系电话"
          placeholder="请输入联系电话"
          :rules="[{ required: true, message: '请输入联系电话' }]"
        />
      </van-cell-group>
      
      <div class="tips">
        <van-icon name="info-o" />
        <span>申请团长需要审核，审核通过后即可发布商品和团购活动</span>
      </div>
      
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          提交申请
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { createLeaderProfile } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  community_name: '',
  address: '',
  phone: ''
})
const loading = ref(false)

async function handleSubmit(values) {
  loading.value = true
  try {
    await createLeaderProfile(values)
    showSuccessToast('申请已提交，请等待审核')
    userStore.fetchProfile()
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.leader-register-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.tips {
  padding: 12px 16px;
  font-size: 12px;
  color: #969799;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>