<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo">📚</div>
      <h1>校园请假审批系统</h1>
      <p>Leave Approval System</p>
    </div>
    
    <van-form @submit="handleSubmit">
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
      
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>
    </van-form>
    
    <div class="tips">
      <p>测试账号：</p>
      <p>学生: student1 / 123456</p>
      <p>一级审批: teacher1 / 123456</p>
      <p>二级审批: teacher2 / 123456</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { login } from '../api'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const res = await login(form)
    if (res.success) {
      localStorage.setItem('user', JSON.stringify(res.data))
      showToast('登录成功')
      router.replace('/')
    } else {
      showToast(res.message || '登录失败')
    }
  } catch (error) {
    showToast('登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: 60px;
}

.login-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.logo {
  font-size: 60px;
  margin-bottom: 10px;
}

.login-header h1 {
  font-size: 24px;
  margin-bottom: 5px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.8;
}

.tips {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-top: 30px;
  line-height: 1.8;
}
</style>
