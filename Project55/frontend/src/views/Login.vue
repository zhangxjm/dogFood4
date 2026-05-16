<template>
  <div class="page-container">
    <van-nav-bar title="登录" />
    <div style="padding: 20px;">
      <van-form @submit="onSubmit">
        <van-field
          v-model="form.username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
        <div style="margin: 16px 0;">
          <van-button round block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
        <div style="text-align: center; color: #1989fa;" @click="goRegister">
          没有账号？立即注册
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '../api'

const router = useRouter()
const form = ref({
  username: '',
  password: ''
})

const onSubmit = async () => {
  try {
    const res = await userApi.login(form.value)
    if (res.data.success) {
      localStorage.setItem('user', JSON.stringify(res.data.data))
      showToast('登录成功')
      router.push('/')
    } else {
      showToast(res.data.message)
    }
  } catch (e) {
    showToast('登录失败')
  }
}

const goRegister = () => {
  router.push('/register')
}
</script>
