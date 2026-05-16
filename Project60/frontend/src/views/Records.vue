<template>
  <div class="records-page">
    <van-nav-bar title="课时记录" fixed placeholder />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field name="class_info" label="选择班级">
          <template #input>
            <van-picker
              :columns="classColumns"
              v-model="form.class_info"
              @confirm="onClassConfirm"
            />
          </template>
        </van-field>
        <van-field name="teacher" label="授课老师">
          <template #input>
            <van-picker
              :columns="teacherColumns"
              v-model="form.teacher"
              @confirm="onTeacherConfirm"
            />
          </template>
        </van-field>
        <van-field name="course" label="所属课程">
          <template #input>
            <van-picker
              :columns="courseColumns"
              v-model="form.course"
              @confirm="onCourseConfirm"
            />
          </template>
        </van-field>
        <van-cell title="上课日期" is-link @click="showDate = true">
          <template #value>
            <span class="value">{{ form.date || '请选择' }}</span>
          </template>
        </van-cell>
        <van-field
          v-model="form.start_time"
          name="start_time"
          label="开始时间"
          placeholder="例如：09:00"
          :rules="[{ required: true }]"
        />
        <van-field
          v-model="form.end_time"
          name="end_time"
          label="结束时间"
          placeholder="例如：10:30"
          :rules="[{ required: true }]"
        />
        <van-field
          v-model="form.hours"
          name="hours"
          label="消耗课时"
          type="number"
          placeholder="请输入课时数"
          :rules="[{ required: true }]"
        />
        <van-field
          v-model="form.content"
          name="content"
          label="课程内容"
          type="textarea"
          placeholder="请输入课程内容"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          记录上课（自动扣减课时）
        </van-button>
      </div>
    </van-form>

    <div class="section">
      <h3 class="section-title">📚 上课记录</h3>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了">
          <van-cell-group v-for="record in records" :key="record.id" class="card-item">
            <van-cell :title="record.class_name">
              <template #label>
                <div style="font-size: 13px; color: #666">
                  老师：{{ record.teacher_name }} · {{ record.date }}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 4px">
                  {{ record.start_time }} - {{ record.end_time }} · 消耗{{ record.hours }}课时
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </van-list>
      </van-pull-refresh>
    </div>

    <van-calendar v-model:show="showDate" @confirm="onConfirmDate" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast } from 'vant'
import { getClasses, getTeachers, getCourses, getClassRecords, createClassRecord } from '../api'

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const submitting = ref(false)
const showDate = ref(false)

const classes = ref([])
const teachers = ref([])
const courses = ref([])
const records = ref([])

const form = ref({
  class_info: null,
  teacher: null,
  course: null,
  date: '',
  start_time: '',
  end_time: '',
  hours: 1,
  content: ''
})

const classColumns = computed(() => {
  return classes.value.map(cls => ({ text: cls.name, value: cls.id }))
})

const teacherColumns = computed(() => {
  return teachers.value.map(t => ({ text: t.name, value: t.id }))
})

const courseColumns = computed(() => {
  return courses.value.map(c => ({ text: c.name, value: c.id }))
})

const loadClasses = async () => {
  try {
    const res = await getClasses()
    classes.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const loadTeachers = async () => {
  try {
    const res = await getTeachers()
    teachers.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const loadCourses = async () => {
  try {
    const res = await getCourses()
    courses.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const loadRecords = async () => {
  try {
    const res = await getClassRecords()
    records.value = res.data.results || res.data
  } catch (e) {
    console.error(e)
  }
}

const onClassConfirm = ({ selectedOptions }) => {
  form.value.class_info = selectedOptions[0].value
  const cls = classes.value.find(c => c.id === form.value.class_info)
  if (cls) {
    form.value.teacher = cls.teacher
    form.value.course = cls.course
  }
}

const onTeacherConfirm = ({ selectedOptions }) => {
  form.value.teacher = selectedOptions[0].value
}

const onCourseConfirm = ({ selectedOptions }) => {
  form.value.course = selectedOptions[0].value
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const onConfirmDate = (value) => {
  form.value.date = formatDate(value)
  showDate.value = false
}

const onRefresh = async () => {
  await loadRecords()
  refreshing.value = false
}

const onSubmit = async () => {
  if (!form.value.class_info || !form.value.course) {
    showToast('请选择班级和课程')
    return
  }

  submitting.value = true
  try {
    await createClassRecord(form.value)
    showToast('记录成功，课时已自动扣减')
    form.value = { class_info: null, teacher: null, course: null, date: '', start_time: '', end_time: '', hours: 1, content: '' }
    await loadRecords()
  } catch (e) {
    showToast('记录失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadClasses()
  loadTeachers()
  loadCourses()
  loadRecords()
})
</script>

<style scoped>
.section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  padding: 0 16px;
  margin-bottom: 12px;
  color: #333;
}

.value {
  color: #969799;
}
</style>
