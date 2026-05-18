<template>
  <div class="leave-type-config-page">
    <van-nav-bar title="请假类型配置" left-text="返回" left-arrow @click-left="() => router.back()" />
    
    <div class="add-btn-wrapper">
      <van-button type="primary" icon="plus" round @click="openAddDialog">
        新增请假类型
      </van-button>
    </div>
    
    <van-pull-refresh v-model="refreshing" @refresh="loadData">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadData"
      >
        <van-cell-group inset>
          <van-cell
            v-for="item in leaveTypes"
            :key="item.id"
            :title="item.typeName"
            :label="item.description || '暂无描述'"
          >
            <template #value>
              <div class="cell-actions">
                <van-tag :type="item.enabled ? 'success' : 'default'" size="small">
                  {{ item.enabled ? '启用' : '禁用' }}
                </van-tag>
                <van-button
                  size="small"
                  type="primary"
                  plain
                  style="margin-left: 8px;"
                  @click="handleToggle(item)"
                >
                  {{ item.enabled ? '禁用' : '启用' }}
                </van-button>
                <van-button
                  size="small"
                  type="warning"
                  plain
                  style="margin-left: 8px;"
                  @click="openEditDialog(item)"
                >
                  编辑
                </van-button>
                <van-button
                  size="small"
                  type="danger"
                  plain
                  style="margin-left: 8px;"
                  @click="handleDelete(item)"
                >
                  删除
                </van-button>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>
    
    <van-popup v-model:show="showDialog" position="bottom" round>
      <div class="dialog-header">
        <span class="dialog-title">{{ isEdit ? '编辑请假类型' : '新增请假类型' }}</span>
        <van-icon name="cross" @click="closeDialog" />
      </div>
      
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.typeCode"
            label="类型编码"
            placeholder="请输入类型编码"
            :rules="[{ required: true, message: '请输入类型编码' }]"
          />
          <van-field
            v-model="form.typeName"
            label="类型名称"
            placeholder="请输入类型名称"
            :rules="[{ required: true, message: '请输入类型名称' }]"
          />
          <van-field
            v-model="form.description"
            label="描述"
            type="textarea"
            placeholder="请输入描述"
            autosize
          />
        </van-cell-group>
        
        <div class="dialog-footer">
          <van-button type="default" @click="closeDialog">取消</van-button>
          <van-button type="primary" native-type="submit" :loading="submitting">
            确定
          </van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import {
  getAllLeaveTypes,
  createLeaveType,
  updateLeaveType,
  toggleLeaveType,
  deleteLeaveType
} from '../api'

const router = useRouter()
const leaveTypes = ref([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const showDialog = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editingId = ref(null)

const form = reactive({
  typeCode: '',
  typeName: '',
  description: ''
})

const loadData = async () => {
  try {
    const res = await getAllLeaveTypes()
    if (res.success !== false) {
      leaveTypes.value = res
    } else {
      showToast(res.message || '加载失败')
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    refreshing.value = false
    finished.value = true
  }
}

const openAddDialog = () => {
  isEdit.value = false
  editingId.value = null
  form.typeCode = ''
  form.typeName = ''
  form.description = ''
  showDialog.value = true
}

const openEditDialog = (item) => {
  isEdit.value = true
  editingId.value = item.id
  form.typeCode = item.typeCode
  form.typeName = item.typeName
  form.description = item.description || ''
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
}

const handleSubmit = async () => {
  if (!form.typeCode.trim()) {
    showToast('请输入类型编码')
    return
  }
  if (!form.typeName.trim()) {
    showToast('请输入类型名称')
    return
  }

  submitting.value = true
  try {
    let res
    if (isEdit.value) {
      res = await updateLeaveType(editingId.value, { ...form })
    } else {
      res = await createLeaveType({ ...form })
    }
    
    if (res.success !== false) {
      showToast(isEdit.value ? '编辑成功' : '新增成功')
      closeDialog()
      loadData()
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    showToast('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleToggle = async (item) => {
  try {
    const res = await toggleLeaveType(item.id)
    if (res.success !== false) {
      showToast(item.enabled ? '禁用成功' : '启用成功')
      loadData()
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    showToast('操作失败')
  }
}

const handleDelete = async (item) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: `确定要删除"${item.typeName}"吗？`
    })
    
    const res = await deleteLeaveType(item.id)
    if (res.success !== false) {
      showToast('删除成功')
      loadData()
    } else {
      showToast(res.message || '删除失败')
    }
  } catch (error) {}
}

loadData()
</script>

<style scoped>
.leave-type-config-page {
  padding-bottom: 30px;
}

.add-btn-wrapper {
  padding: 16px;
}

.cell-actions {
  display: flex;
  align-items: center;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.dialog-title {
  font-size: 16px;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.dialog-footer .van-button {
  flex: 1;
}
</style>