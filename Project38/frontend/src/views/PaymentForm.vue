<template>
  <div class="payment-form">
    <van-nav-bar
      title="登记缴费"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.amount"
          name="amount"
          label="缴费金额"
          placeholder="请输入缴费金额"
          type="number"
          :rules="[{ required: true, message: '请输入缴费金额' }]"
        />
        
        <van-field
          v-model="form.paymentDate"
          name="paymentDate"
          label="缴费日期"
          placeholder="请选择缴费日期"
          readonly
          is-link
          :rules="[{ required: true, message: '请选择缴费日期' }]"
          @click="showDatePicker = true"
        />
        
        <van-field
          v-model="form.paymentMethod"
          name="paymentMethod"
          label="缴费方式"
          placeholder="请选择缴费方式"
          readonly
          is-link
          @click="showMethodPicker = true"
        />
        
        <van-field
          v-model="form.description"
          name="description"
          label="备注"
          placeholder="请输入备注"
          type="textarea"
        />
      </van-cell-group>
      
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
    
    <van-calendar
      v-model:show="showDatePicker"
      type="single"
      @confirm="onDateConfirm"
      color="#1989fa"
    />
    
    <van-popup v-model:show="showMethodPicker" position="bottom">
      <van-picker
        :columns="methodColumns"
        @confirm="onMethodConfirm"
        @cancel="showMethodPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { paymentApi } from '../api'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

const studentId = route.params.studentId

const form = ref({
  amount: '',
  paymentDate: '',
  paymentMethod: '',
  description: ''
})

const currentDate = ref(new Date())
const showDatePicker = ref(false)
const showMethodPicker = ref(false)

const methodColumns = [
  { text: '现金', value: '现金' },
  { text: '微信', value: '微信' },
  { text: '支付宝', value: '支付宝' },
  { text: '银行卡', value: '银行卡' }
]

const onDateConfirm = (value) => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  form.value.paymentDate = `${year}-${month}-${day}`
  showDatePicker.value = false
}

const onMethodConfirm = ({ selectedOptions }) => {
  form.value.paymentMethod = selectedOptions[0].text
  showMethodPicker.value = false
}

const onSubmit = async () => {
  try {
    const submitData = {
      student: { id: parseInt(studentId) },
      amount: form.value.amount ? parseFloat(form.value.amount) : 0,
      paymentDate: form.value.paymentDate,
      paymentMethod: form.value.paymentMethod,
      description: form.value.description
    }
    
    await paymentApi.create(submitData)
    showToast('登记成功')
    setTimeout(() => {
      router.back()
    }, 1000)
  } catch (error) {
    showToast('操作失败')
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
})
</script>

<style scoped>
.payment-form {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}
</style>
