<template>
  <div class="student-form">
    <van-nav-bar
      :title="isEdit ? '编辑学员' : '新增学员'"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          name="name"
          label="学员姓名"
          placeholder="请输入学员姓名"
          :rules="[{ required: true, message: '请输入学员姓名' }]"
        />
        
        <van-field
          v-model="form.gender"
          name="gender"
          label="性别"
          placeholder="请选择性别"
          readonly
          is-link
          @click="showGenderPicker = true"
        />
        
        <van-field
          v-model="form.birthDate"
          name="birthDate"
          label="出生日期"
          placeholder="请选择出生日期"
          readonly
          is-link
          @click="showDatePicker = true"
        />
        
        <van-field
          v-model="form.phone"
          name="phone"
          label="学员电话"
          placeholder="请输入学员电话"
        />
        
        <van-field
          v-model="form.parentName"
          name="parentName"
          label="家长姓名"
          placeholder="请输入家长姓名"
        />
        
        <van-field
          v-model="form.parentPhone"
          name="parentPhone"
          label="家长电话"
          placeholder="请输入家长电话"
          :rules="[{ required: true, message: '请输入家长电话' }]"
        />
        
        <van-field
          v-model="form.address"
          name="address"
          label="家庭地址"
          placeholder="请输入家庭地址"
          type="textarea"
        />
        
        <van-field
          v-model="form.notes"
          name="notes"
          label="备注"
          placeholder="请输入备注"
          type="textarea"
        />
      </van-cell-group>
      
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          {{ isEdit ? '保存修改' : '提交' }}
        </van-button>
      </div>
    </van-form>
    
    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genders"
        @confirm="onGenderConfirm"
        @cancel="showGenderPicker = false"
      />
    </van-popup>
    
    <van-calendar
      v-model:show="showDatePicker"
      type="single"
      @confirm="onDateConfirm"
      color="#1989fa"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { studentApi } from '../api'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const studentId = computed(() => route.params.id)

const form = ref({
  name: '',
  gender: '',
  birthDate: '',
  phone: '',
  parentName: '',
  parentPhone: '',
  address: '',
  notes: ''
})

const genders = [
  { text: '男', value: '男' },
  { text: '女', value: '女' }
]

const showGenderPicker = ref(false)
const showDatePicker = ref(false)
const currentDate = ref(new Date())

const onGenderConfirm = ({ selectedOptions }) => {
  form.value.gender = selectedOptions[0].text
  showGenderPicker.value = false
}

const onDateConfirm = (value) => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  form.value.birthDate = `${year}-${month}-${day}`
  showDatePicker.value = false
}

const fetchStudent = async () => {
  try {
    const response = await studentApi.getById(studentId.value)
    const student = response.data
    form.value = {
      name: student.name || '',
      gender: student.gender || '',
      birthDate: student.birthDate || '',
      phone: student.phone || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      address: student.address || '',
      notes: student.notes || ''
    }
  } catch (error) {
    showToast('获取学员信息失败')
  }
}

const onSubmit = async () => {
  try {
    if (isEdit.value) {
      await studentApi.update(studentId.value, form.value)
      showToast('修改成功')
    } else {
      await studentApi.create(form.value)
      showToast('添加成功')
    }
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
  if (isEdit.value) {
    fetchStudent()
  }
})
</script>

<style scoped>
.student-form {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}
</style>
