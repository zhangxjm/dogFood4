<template>
  <div class="order-verify-page">
    <van-nav-bar title="订单核销" />
    
    <div class="verify-form">
      <van-cell-group inset>
        <van-field
          v-model="verificationCode"
          name="code"
          label="核销码"
          placeholder="请输入8位核销码"
          maxlength="8"
        />
      </van-cell-group>
      
      <div style="margin: 16px">
        <van-button round block type="primary" :loading="loading" @click="handleVerify">
          确认核销
        </van-button>
      </div>
    </div>
    
    <div class="verify-hint">
      <van-icon name="info-o" />
      <span>请用户出示核销码，输入后确认核销</span>
    </div>
    
    <van-popup v-model:show="showResult" position="center" round>
      <div class="verify-result" v-if="verifySuccess">
        <van-icon name="checked" class="success-icon" />
        <h3>核销成功</h3>
        <p>订单号：{{ verifiedOrder?.order_no }}</p>
        <p>实付金额：¥{{ verifiedOrder?.pay_amount }}</p>
      </div>
      <div class="verify-result" v-else>
        <van-icon name="close" class="fail-icon" />
        <h3>核销失败</h3>
        <p>{{ errorMessage }}</p>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { verifyOrder } from '@/api/orders'

const verificationCode = ref('')
const loading = ref(false)
const showResult = ref(false)
const verifySuccess = ref(false)
const verifiedOrder = ref(null)
const errorMessage = ref('')

async function handleVerify() {
  if (!verificationCode.value || verificationCode.value.length !== 8) {
    showToast('请输入8位核销码')
    return
  }
  
  loading.value = true
  try {
    const res = await verifyOrder({ verification_code: verificationCode.value })
    verifySuccess.value = true
    verifiedOrder.value = res.order
    showResult.value = true
    verificationCode.value = ''
  } catch (e) {
    verifySuccess.value = false
    errorMessage.value = e.response?.data?.detail || '核销失败，请重试'
    showResult.value = true
  } finally {
    loading.value = false
    setTimeout(() => {
      showResult.value = false
    }, 2000)
  }
}
</script>

<style scoped lang="less">
.order-verify-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.verify-form {
  padding: 20px 0;
}

.verify-hint {
  padding: 12px 20px;
  font-size: 13px;
  color: #969799;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.verify-result {
  padding: 40px 60px;
  text-align: center;
  
  .success-icon {
    font-size: 60px;
    color: #07c160;
  }
  
  .fail-icon {
    font-size: 60px;
    color: #ee0a24;
  }
  
  h3 {
    margin: 16px 0 8px;
    font-size: 18px;
  }
  
  p {
    margin: 4px 0;
    font-size: 14px;
    color: #969799;
  }
}
</style>