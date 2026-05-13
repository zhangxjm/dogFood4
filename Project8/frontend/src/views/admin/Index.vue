<template>
  <div class="admin-page page">
    <van-nav-bar title="管理端" :arrow="false" />
    
    <div class="admin-grid">
      <van-grid :column-num="2">
        <van-grid-item icon="qr" text="餐桌二维码" @click="$router.push('/qrcode')" />
        <van-grid-item icon="orders-o" text="店员接单" @click="$router.push('/staff')" />
        <van-grid-item icon="fire-o" text="后厨系统" @click="$router.push('/kitchen')" />
        <van-grid-item icon="shop-o" text="顾客点餐" @click="goMenu" />
      </van-grid>
    </div>

    <div class="tables-section" v-if="tables.length > 0">
      <div class="section-title">
        餐桌列表
        <van-button type="primary" size="small" @click="showAddTable = true">
          添加餐桌
        </van-button>
      </div>
      
      <van-cell-group inset>
        <van-cell
          v-for="table in tables"
          :key="table.id"
          :title="table.tableName"
          :label="'桌号: ' + table.tableNo + ' | 座位: ' + table.seats"
          is-link
          @click="viewTable(table)"
        >
          <template #right-icon>
            <span :class="['status-badge', 'status-' + table.status.toLowerCase()]">
              {{ table.status === 'AVAILABLE' ? '空闲' : '使用中' }}
            </span>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <van-dialog
      v-model:show="showAddTable"
      title="添加餐桌"
      @confirm="addTable"
    >
      <van-form>
        <van-field
          v-model="newTable.tableNo"
          label="桌号"
          placeholder="如: A01"
          :rules="[{ required: true, message: '请输入桌号' }]"
        />
        <van-field
          v-model="newTable.tableName"
          label="名称"
          placeholder="如: 1号桌"
        />
        <van-field
          v-model.number="newTable.seats"
          label="座位数"
          type="number"
          :value="2"
          placeholder="2"
        />
      </van-form>
    </van-dialog>

    <van-loading v-if="loading" type="spinner" class="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { getTables, createTable } from '@/api'

const router = useRouter()
const tables = ref([])
const loading = ref(true)
const showAddTable = ref(false)
const newTable = ref({ tableNo: '', tableName: '', seats: 2 })

const loadTables = async () => {
  try {
    tables.value = await getTables()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const addTable = async () => {
  if (!newTable.value.tableNo) {
    showToast('请输入桌号')
    return
  }
  try {
    await createTable(newTable.value)
    showToast('添加成功')
    showAddTable.value = false
    newTable.value = { tableNo: '', tableName: '', seats: 2 }
    loadTables()
  } catch (e) {
    console.error(e)
  }
}

const viewTable = (table) => {
  sessionStorage.setItem('selectedTable', JSON.stringify(table))
  router.push('/qrcode')
}

const goMenu = () => {
  if (tables.value.length > 0) {
    router.push('/menu?tableNo=' + tables.value[0].tableNo)
  } else {
    router.push('/menu')
  }
}

onMounted(loadTables)
</script>

<style scoped lang="less">
.admin-page {
  padding-top: 0;
}

.admin-grid {
  margin: 10px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.tables-section {
  padding: 10px;
  
  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    font-size: 14px;
    color: #666;
    font-weight: bold;
  }
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
