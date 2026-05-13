<template>
  <div class="leader-pickup-page">
    <van-nav-bar title="自提点管理">
      <template #right>
        <van-button type="primary" size="small" @click="showCreateForm = true">
          新增
        </van-button>
      </template>
    </van-nav-bar>
    
    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="pickupPoints.length === 0" description="暂无自提点" />
    
    <div class="pickup-list">
      <van-cell-group v-for="point in pickupPoints" :key="point.id" class="pickup-card" inset>
        <van-cell :title="point.name" :value="point.status === 'active' ? '营业中' : '已关闭'" />
        <van-cell title="地址" :value="point.address" />
        <van-cell title="电话" :value="point.phone" />
        <van-cell v-if="point.business_hours" title="营业时间" :value="point.business_hours" />
        <van-cell>
          <template #value>
            <div class="actions">
              <van-button size="mini" @click="editPoint(point)">
                编辑
              </van-button>
              <van-button
                v-if="point.status === 'active'"
                size="mini"
                type="warning"
                @click="toggleStatus(point, 'closed')"
              >
                关闭
              </van-button>
              <van-button
                v-else
                size="mini"
                type="success"
                @click="toggleStatus(point, 'active')"
              >
                启用
              </van-button>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <van-popup v-model:show="showCreateForm" position="bottom" round :style="{ height: '70%' }">
      <div class="popup-header">
        <h3>{{ editingPoint ? '编辑自提点' : '新增自提点' }}</h3>
        <van-icon name="cross" size="22" @click="showCreateForm = false" />
      </div>
      <van-form @submit="handleSave">
        <van-cell-group inset>
          <van-field
            v-model="pointForm.name"
            name="name"
            label="名称"
            placeholder="请输入自提点名称"
            :rules="[{ required: true, message: '请输入名称' }]"
          />
          <van-field
            v-model="pointForm.address"
            name="address"
            label="地址"
            placeholder="请输入详细地址"
            :rules="[{ required: true, message: '请输入地址' }]"
          />
          <van-field
            v-model="pointForm.phone"
            name="phone"
            label="电话"
            placeholder="请输入联系电话"
            :rules="[{ required: true, message: '请输入电话' }]"
          />
          <van-field
            v-model="pointForm.business_hours"
            name="business_hours"
            label="营业时间"
            placeholder="如：9:00-21:00"
          />
        </van-cell-group>
        <div style="margin: 16px">
          <van-button round block type="primary" native-type="submit" :loading="saving">
            保存
          </van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showSuccessToast } from 'vant'
import { getMyPickupPoints, createPickupPoint, updatePickupPoint } from '@/api/pickup'

const loading = ref(false)
const saving = ref(false)
const pickupPoints = ref([])
const showCreateForm = ref(false)
const editingPoint = ref(null)

const pointForm = ref({
  name: '',
  address: '',
  phone: '',
  business_hours: ''
})

async function fetchPoints() {
  loading.value = true
  try {
    const res = await getMyPickupPoints()
    pickupPoints.value = res
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function editPoint(point) {
  editingPoint.value = point
  pointForm.value = {
    name: point.name,
    address: point.address,
    phone: point.phone,
    business_hours: point.business_hours || ''
  }
  showCreateForm.value = true
}

async function toggleStatus(point, status) {
  try {
    await updatePickupPoint(point.id, { status })
    showSuccessToast('操作成功')
    fetchPoints()
  } catch (e) {
    console.error(e)
  }
}

async function handleSave(values) {
  saving.value = true
  try {
    if (editingPoint.value) {
      await updatePickupPoint(editingPoint.value.id, values)
    } else {
      await createPickupPoint(values)
    }
    showSuccessToast('保存成功')
    showCreateForm.value = false
    editingPoint.value = null
    pointForm.value = { name: '', address: '', phone: '', business_hours: '' }
    fetchPoints()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchPoints()
})
</script>

<style scoped lang="less">
.leader-pickup-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.loading {
  text-align: center;
  padding: 40px 0;
}

.pickup-list {
  padding: 12px;
}

.pickup-card {
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 8px;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
  
  h3 {
    margin: 0;
    font-size: 16px;
  }
}
</style>