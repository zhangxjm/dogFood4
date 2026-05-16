<template>
  <div class="students-page">
    <van-nav-bar title="学员管理" fixed placeholder />
    
    <van-search
      v-model="searchText"
      placeholder="搜索学员"
      style="padding: 12px 16px"
    />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell-group v-for="student in filteredStudents" :key="student.id" class="card-item">
          <van-cell :title="student.name">
            <template #icon>
              <div class="avatar">{{ student.name.charAt(0) }}</div>
            </template>
            <template #label>
              <div style="font-size: 13px; color: #666">
                {{ student.gender === 'male' ? '男' : '女' }} · {{ student.age }}岁 · {{ student.parent_name }}
              </div>
              <div style="font-size: 12px; color: #999; margin-top: 4px">
                📞 {{ student.phone }}
              </div>
            </template>
            <template #right-icon>
              <van-button size="small" type="danger" plain @click="deleteItem(student)">
                删除
              </van-button>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>

    <van-fab
      icon="plus"
      @click="showAdd = true"
      style="right: 16px; bottom: 70px"
    />

    <van-popup v-model:show="showAdd" position="bottom" round>
      <div class="popup-content">
        <h3 class="popup-title">添加学员</h3>
        <van-form @submit="onSubmit">
          <van-field
            v-model="form.name"
            name="name"
            label="姓名"
            placeholder="请输入姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
          />
          <van-field name="gender" label="性别">
            <template #input>
              <van-radio-group v-model="form.gender" direction="horizontal">
                <van-radio name="male">男</van-radio>
                <van-radio name="female">女</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            v-model="form.age"
            name="age"
            label="年龄"
            type="number"
            placeholder="请输入年龄"
            :rules="[{ required: true, message: '请输入年龄' }]"
          />
          <van-field
            v-model="form.parent_name"
            name="parent_name"
            label="家长姓名"
            placeholder="请输入家长姓名"
            :rules="[{ required: true, message: '请输入家长姓名' }]"
          />
          <van-field
            v-model="form.phone"
            name="phone"
            label="联系电话"
            placeholder="请输入联系电话"
            :rules="[{ required: true, message: '请输入联系电话' }]"
          />
          <div style="margin: 16px">
            <van-button round block type="primary" native-type="submit">
              提交
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getStudents, createStudent, deleteStudent } from '../api'

const searchText = ref('')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const showAdd = ref(false)
const students = ref([])

const form = ref({
  name: '',
  gender: 'male',
  age: '',
  parent_name: '',
  phone: ''
})

const filteredStudents = computed(() => {
  if (!searchText.value) return students.value
  return students.value.filter(s => 
    s.name.includes(searchText.value) || 
    s.parent_name.includes(searchText.value)
  )
})

const loadData = async () => {
  try {
    const res = await getStudents()
    students.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const onLoad = () => {
  finished.value = true
  loading.value = false
}

const onRefresh = async () => {
  await loadData()
  refreshing.value = false
}

const onSubmit = async () => {
  try {
    await createStudent(form.value)
    showToast('添加成功')
    showAdd.value = false
    form.value = { name: '', gender: 'male', age: '', parent_name: '', phone: '' }
    await loadData()
  } catch (e) {
    showToast('添加失败')
  }
}

const deleteItem = async (student) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除学员"${student.name}"吗？`
    })
    await deleteStudent(student.id)
    showToast('删除成功')
    await loadData()
  } catch (e) {
    if (e !== 'cancel') {
      showToast('删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.popup-content {
  padding: 20px;
}

.popup-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}
</style>
