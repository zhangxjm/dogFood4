<template>
  <div class="register-page">
    <van-nav-bar title="注册" left-arrow @click-left="router.back()" />
    <van-form @submit="handleRegister">
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
          placeholder="请输入密码（至少6位）"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
        <van-field
          v-model="form.password2"
          type="password"
          name="password2"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[{ required: true, message: '请确认密码' }]"
        />
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
        />
        <van-field name="role" label="用户类型" is-link readonly>
          <template #input>
            <van-radio-group v-model="form.role" direction="horizontal">
              <van-radio name="user">普通用户</van-radio>
              <van-radio name="leader">团长</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          注册
        </van-button>
      </div>
    </van-form>
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
  password: '',
  password2: '',
  phone: '',
  role: 'user'
})
const loading = ref(false)

async function handleRegister(values) {
  if (values.password !== values.password2) {
    showToast('两次密码不一致')
    return
  }
  
  loading.value = true
  try {
    await userStore.doRegister(values)
    showToast('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.register-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>
