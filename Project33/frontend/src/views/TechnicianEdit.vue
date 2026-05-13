<template>
  <div class="page-container" style="padding-bottom: 80px">
    <van-nav-bar
      :title="isEdit ? '编辑技师' : '添加技师'"
      left-arrow
      @click-left="onBack"
    />
    
    <div class="page-content">
      <van-form ref="formRef" @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.name"
            name="name"
            label="姓名"
            placeholder="请输入技师姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
          />
          
          <van-field
            v-model="form.phone"
            name="phone"
            label="电话"
            placeholder="请输入联系电话"
          />
          
          <van-field
            name="gender"
            label="性别"
            readonly
            clickable
            :value="getGenderLabel(form.gender)"
            @click="showGenderPicker = true"
          />
          
          <van-field
            v-model="form.position"
            name="position"
            label="职位"
            placeholder="例如：首席发型师"
          />
          
          <van-field
            v-model="form.skills"
            name="skills"
            label="擅长"
            type="textarea"
            rows="2"
            placeholder="例如：剪发、烫染、造型"
          />
          
          <van-field
            v-if="isEdit"
            name="status"
            label="状态"
            readonly
            clickable
            :value="getStatusLabel(form.status)"
            @click="showStatusPicker = true"
          />
        </van-cell-group>
        
        <div style="margin-top: 24px; padding: 0 16px">
          <van-button type="primary" round block native-type="submit" :loading="submitting">
            保存
          </van-button>
          
          <van-button
            v-if="isEdit"
            type="danger"
            plain
            round
            block
            style="margin-top: 12px"
            @click="onDelete"
          >
            删除技师
          </van-button>
        </div>
      </van-form>
    </div>
    
    <van-picker
      :columns="GENDER_OPTIONS.map(g => ({ text: g.label, value: g.value }))"
      v-model:show="showGenderPicker"
      title="选择性别"
      @confirm="onGenderConfirm"
      @cancel="showGenderPicker = false"
    />
    
    <van-picker
      :columns="STATUS_OPTIONS.map(s => ({ text: s.label, value: s.value }))"
      v-model:show="showStatusPicker"
      title="选择状态"
      @confirm="onStatusConfirm"
      @cancel="showStatusPicker = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast, showDialog } from 'vant'
import { technicianApi, GENDER_OPTIONS, STATUS_OPTIONS } from '../api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const formRef = ref(null)
const submitting = ref(false)
const loading = ref(false)
const showGenderPicker = ref(false)
const showStatusPicker = ref(false)

const form = ref({
  name: '',
  phone: '',
  gender: 'male',
  position: '',
  skills: '',
  status: 'active'
})

const getGenderLabel = (value) => {
  const g = GENDER_OPTIONS.find(o => o.value === value)
  return g ? g.label : ''
}

const getStatusLabel = (value) => {
  const s = STATUS_OPTIONS.find(o => o.value === value)
  return s ? s.label : ''
}

const onBack = () => {
  router.back()
}

const onGenderConfirm = ({ selectedOptions }) => {
  form.value.gender = selectedOptions[0].value
  showGenderPicker.value = false
}

const onStatusConfirm = ({ selectedOptions }) => {
  form.value.status = selectedOptions[0].value
  showStatusPicker.value = false
}

const loadTechnician = async () => {
  if (!isEdit.value) return
  
  loading.value = true
  try {
    const res = await technicianApi.get(route.params.id)
    form.value = {
      name: res.data.name || '',
      phone: res.data.phone || '',
      gender: res.data.gender || 'male',
      position: res.data.position || '',
      skills: res.data.skills || '',
      status: res.data.status || 'active'
    }
  } catch (e) {
    showToast('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await technicianApi.update(route.params.id, form.value)
      showSuccessToast('更新成功')
    } else {
      await technicianApi.create(form.value)
      showSuccessToast('添加成功')
    }
    router.back()
  } catch (e) {
    const errors = e.response?.data
    if (errors?.name?.[0]) {
      showToast(errors.name[0])
    } else {
      showToast('保存失败')
    }
  } finally {
    submitting.value = false
  }
}

const onDelete = () => {
  showDialog({
    title: '确认删除',
    message: '删除后不可恢复，确定要删除该技师吗？'
  }).then(async () => {
    try {
      await technicianApi.delete(route.params.id)
      showSuccessToast('删除成功')
      router.back()
    } catch (e) {
      showToast('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadTechnician()
})
</script>
