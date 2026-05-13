<template>
  <div class="login-page">
    <div class="login-header">
      <h2>社区团购</h2>
      <p>品质生活，团购更优惠</p>
    </div>
    <van-form @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>
    </van-form>
    <div class="links">
      <router-link to="/register">新用户注册</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)

async function handleLogin(values) {
  loading.value = true
  try {
    await userStore.doLogin(values.username, values.password)
    showToast('登录成功')
    router.push('/home')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1989fa 0%, #5fb7ff 100%);
  padding-top: 100px;
}

.login-header {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
  h2 {
    font-size: 32px;
    margin-bottom: 8px;
  }
  p {
    font-size: 14px;
    opacity: 0.9;
  }
}

.links {
  text-align: center;
  margin-top: 16px;
  a {
    color: #fff;
    font-size: 14px;
  }
}
</style>
