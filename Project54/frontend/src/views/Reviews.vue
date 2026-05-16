<template>
  <div>
    <el-card shadow="hover">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>服务评价管理</span>
          <el-button type="primary" @click="openDialog()">
            <el-icon><Plus /></el-icon>
            新增评价
          </el-button>
        </div>
      </template>
      <el-table :data="reviews" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="预约信息" width="250">
          <template #default="{ row }">
            <div>
              <el-tag type="info" size="small">ID: {{ row.reservation?.id }}</el-tag>
            </div>
            <div style="margin-top: 5px">
              {{ row.reservation?.pet?.petName }} - {{ row.reservation?.package?.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="200">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled show-score />
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="评价内容" />
        <el-table-column prop="createdAt" label="评价时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑评价' : '新增评价'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="选择预约" prop="reservationId">
          <el-select v-model="form.reservationId" placeholder="请选择已完成的预约" style="width: 100%" filterable>
            <el-option
              v-for="reservation in completedReservations"
              :key="reservation.id"
              :label="`预约${reservation.id}: ${reservation.pet?.petName} - ${reservation.package?.name}`"
              :value="reservation.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="form.rating" show-score />
        </el-form-item>
        <el-form-item label="评价内容" prop="comment">
          <el-input
            v-model="form.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入评价内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reviewsAPI, reservationsAPI } from '../api'
import { Plus } from '@element-plus/icons-vue'

const reviews = ref([])
const reservations = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  reservationId: null,
  rating: 5,
  comment: ''
})

const rules = {
  reservationId: [{ required: true, message: '请选择预约', trigger: 'change' }],
  rating: [{ required: true, message: '请评分', trigger: 'change' }]
}

const completedReservations = computed(() => {
  const reviewedIds = reviews.value.map(r => r.reservationId)
  return reservations.value.filter(r => 
    r.status === 'completed' && !reviewedIds.includes(r.id)
  )
})

const loadReviews = async () => {
  try {
    const response = await reviewsAPI.getAll()
    reviews.value = response.data.data
  } catch (error) {
    ElMessage.error('加载评价数据失败')
  }
}

const loadReservations = async () => {
  try {
    const response = await reservationsAPI.getAll()
    reservations.value = response.data.data
  } catch (error) {
    ElMessage.error('加载预约数据失败')
  }
}

const openDialog = (row = null) => {
  isEdit.value = !!row
  if (row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, {
      id: null,
      reservationId: null,
      rating: 5,
      comment: ''
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await reviewsAPI.update(form.id, form)
          ElMessage.success('更新成功')
        } else {
          await reviewsAPI.create(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadReviews()
      } catch (error) {
        ElMessage.error('操作失败，只能对已完成的预约进行评价！')
      }
    }
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评价吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await reviewsAPI.delete(id)
    ElMessage.success('删除成功')
    loadReviews()
  } catch {
  }
}

onMounted(() => {
  loadReviews()
  loadReservations()
})
</script>
