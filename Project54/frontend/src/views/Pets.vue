<template>
  <div>
    <el-card shadow="hover">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>宠物信息管理</span>
          <el-button type="primary" @click="openDialog()">
            <el-icon><Plus /></el-icon>
            新增宠物
          </el-button>
        </div>
      </template>
      <el-table :data="pets" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="ownerName" label="主人姓名" width="120" />
        <el-table-column prop="ownerPhone" label="联系电话" width="150" />
        <el-table-column prop="petName" label="宠物名称" width="120" />
        <el-table-column prop="petType" label="宠物类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.petType === '狗' ? 'primary' : 'success'">{{ row.petType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="breed" label="品种" width="120" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="weight" label="体重(kg)" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑宠物' : '新增宠物'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主人姓名" prop="ownerName">
              <el-input v-model="form.ownerName" placeholder="请输入主人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="ownerPhone">
              <el-input v-model="form.ownerPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="宠物名称" prop="petName">
              <el-input v-model="form.petName" placeholder="请输入宠物名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宠物类型" prop="petType">
              <el-select v-model="form.petType" placeholder="请选择宠物类型" style="width: 100%">
                <el-option label="狗" value="狗" />
                <el-option label="猫" value="猫" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="品种" prop="breed">
              <el-input v-model="form.breed" placeholder="请输入品种" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="form.age" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="体重" prop="weight">
              <el-input-number v-model="form.weight" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="健康信息" prop="healthInfo">
          <el-input
            v-model="form.healthInfo"
            type="textarea"
            :rows="3"
            placeholder="请输入健康信息"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { petsAPI } from '../api'
import { Plus } from '@element-plus/icons-vue'

const pets = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  ownerName: '',
  ownerPhone: '',
  petName: '',
  petType: '',
  breed: '',
  age: 0,
  weight: 0,
  healthInfo: ''
})

const rules = {
  ownerName: [{ required: true, message: '请输入主人姓名', trigger: 'blur' }],
  ownerPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  petName: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  petType: [{ required: true, message: '请选择宠物类型', trigger: 'change' }]
}

const loadPets = async () => {
  try {
    const response = await petsAPI.getAll()
    pets.value = response.data.data
  } catch (error) {
    ElMessage.error('加载宠物数据失败')
  }
}

const openDialog = (row = null) => {
  isEdit.value = !!row
  if (row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, {
      id: null,
      ownerName: '',
      ownerPhone: '',
      petName: '',
      petType: '',
      breed: '',
      age: 0,
      weight: 0,
      healthInfo: ''
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
          await petsAPI.update(form.id, form)
          ElMessage.success('更新成功')
        } else {
          await petsAPI.create(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadPets()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条宠物信息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await petsAPI.delete(id)
    ElMessage.success('删除成功')
    loadPets()
  } catch {
  }
}

onMounted(() => {
  loadPets()
})
</script>
