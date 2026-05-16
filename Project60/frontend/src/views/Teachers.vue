<template>
  <div class="teachers-page">
    <van-nav-bar title="老师管理" fixed placeholder />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了">
        <van-cell-group v-for="teacher in teachers" :key="teacher.id" class="card-item">
          <van-cell :title="teacher.name">
            <template #label>
              <div style="font-size: 13px; color: #666">
                教授科目：{{ teacher.subject }}
              </div>
              <div style="font-size: 12px; color: #999; margin-top: 4px">
                📞 {{ teacher.phone }} · 教龄{{ teacher.experience }}年
              </div>
            </template>
            <template #right-icon>
              <van-button size="small" type="danger" plain @click="deleteItem(teacher)">
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
        <h3 class="popup-title">添加老师</h3>
        <van-form @submit="onSubmit">
          <van-field
            v-model="form.name"
            name="name"
            label="姓名"
            placeholder="请输入姓名"
            :rules="[{ required: true }]"
          />
          <van-field
            v-model="form.phone"
            name="phone"
            label="电话"
            placeholder="请输入电话"
            :rules="[{ required: true }]"
          />
          <van-field
            v-model="form.subject"
            name="subject"
            label="教授科目"
            placeholder="例如：绘画、钢琴"
            :rules="[{ required: true }]"
          />
          <van-field
            v-model="form.experience"
            name="experience"
            label="教龄(年)"
            type="number"
            placeholder="请输入教龄"
            :rules="[{ required: true }]"
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
import { ref, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getTeachers, createTeacher, deleteTeacher } from '../api'

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const showAdd = ref(false)
const teachers = ref([])

const form = ref({
  name: '',
  phone: '',
  subject: '',
  experience: ''
})

const loadData = async () => {
  try {
    const res = await getTeachers()
    teachers.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const onRefresh = async () => {
  await loadData()
  refreshing.value = false
}

const onSubmit = async () => {
  try {
    await createTeacher(form.value)
    showToast('添加成功')
    showAdd.value = false
    form.value = { name: '', phone: '', subject: '', experience: '' }
    await loadData()
  } catch (e) {
    showToast('添加失败')
  }
}

const deleteItem = async (teacher) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除老师"${teacher.name}"吗？`
    })
    await deleteTeacher(teacher.id)
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
</style>
