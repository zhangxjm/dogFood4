<template>
  <div class="kitchen-page page">
    <van-nav-bar title="后厨系统" :arrow="false">
      <template #right>
        <span @click="refresh" class="refresh-btn">
          <van-icon name="refresh" /> 刷新
        </span>
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="activeTab">
      <van-tab title="待出餐">
        <div class="order-list" v-if="unprintedOrders.length > 0">
          <div
            v-for="order in unprintedOrders"
            :key="order.orderNo"
            class="order-card"
          >
            <div class="order-header">
              <span class="table-tag">
                {{ tableMap[order.tableId]?.tableName || '未知桌号' }}
              </span>
              <span class="order-time">{{ formatTime(order.createdAt) }}</span>
            </div>
            
            <div class="order-items">
              <div
                v-for="item in (orderItemsMap[order.orderNo] || [])"
                :key="item.id"
                class="item-row"
              >
                <span class="item-name">{{ item.dishName }}</span>
                <span class="item-qty">x{{ item.quantity }}</span>
              </div>
            </div>
            
            <div class="order-actions">
              <van-button type="primary" size="small" @click="printOrder(order)">
                打印订单
              </van-button>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无新订单" />
      </van-tab>

      <van-tab title="出餐中">
        <div class="order-list" v-if="preparingOrders.length > 0">
          <div
            v-for="order in preparingOrders"
            :key="order.orderNo"
            class="order-card"
          >
            <div class="order-header">
              <span class="table-tag">
                {{ tableMap[order.tableId]?.tableName || '未知桌号' }}
              </span>
              <span class="order-time">{{ formatTime(order.createdAt) }}</span>
            </div>
            
            <div class="order-items">
              <div
                v-for="item in (orderItemsMap[order.orderNo] || [])"
                :key="item.id"
                class="item-row"
              >
                <span class="item-name">{{ item.dishName }}</span>
                <span class="item-qty">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无出餐中订单" />
      </van-tab>

      <van-tab title="今日统计">
        <div class="stats-page">
          <van-cell-group inset>
            <van-cell title="日期" :value="today" />
            <van-cell title="营业额">
              <template #default>
                <span class="price big">¥{{ stats.revenue || 0 }}</span>
              </template>
            </van-cell>
            <van-cell title="订单数" :value="stats.orderCount || 0" />
          </van-cell-group>

          <div class="section-title">今日订单</div>
          <van-cell-group inset v-if="stats.orders?.length > 0">
            <van-cell
              v-for="order in stats.orders"
              :key="order.orderNo"
              :title="tableMap[order.tableId]?.tableName || order.orderNo"
              :value="'¥' + order.payAmount"
            >
              <template #label>
                {{ formatTime(order.createdAt) }}
                <span
                  :class="['status-badge', 'status-' + order.status.toLowerCase()]"
                  style="margin-left: 8px"
                >
                  {{ statusText(order.status) }}
                </span>
              </template>
            </van-cell>
          </van-cell-group>
          <van-empty v-else description="暂无订单" />
        </div>
      </van-tab>
    </van-tabs>

    <van-popup v-model:show="printPopup" position="center" round>
      <div class="print-content">
        <div class="print-header">
          <div class="shop-name">小吃店厨房小票</div>
          <div class="print-time">打印时间: {{ printTime }}</div>
        </div>
        
        <div class="print-body" v-if="printOrderData">
          <div class="info-row">
            <span>桌号:</span>
            <span>{{ tableMap[printOrderData.order.tableId]?.tableName || '未知' }}</span>
          </div>
          <div class="info-row">
            <span>订单号:</span>
            <span>{{ printOrderData.order.orderNo }}</span>
          </div>
          <div class="info-row">
            <span>时间:</span>
            <span>{{ formatTime(printOrderData.order.createdAt) }}</span>
          </div>
          
          <div class="divider"></div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>菜品</th>
                <th>数量</th>
                <th>金额</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in printOrderData.items" :key="item.id">
                <td>{{ item.dishName }}</td>
                <td>{{ item.quantity }}</td>
                <td>¥{{ item.amount }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">合计</td>
                <td>¥{{ printOrderData.order.totalAmount }}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="divider"></div>
          <div class="print-footer">祝您用餐愉快</div>
        </div>
        
        <div class="print-actions">
          <van-button type="default" @click="printPopup = false">关闭</van-button>
          <van-button type="primary" @click="doPrint">确认打印</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'
import { getPendingOrders, getTables, getDailyStats, markOrderPrinted, updateOrderStatus } from '@/api'

const activeTab = ref(0)
const orders = ref([])
const tables = ref([])
const tableMap = ref({})
const orderItemsMap = ref({})
const stats = ref({})
const today = ref('')
const printPopup = ref(false)
const printOrderData = ref(null)
const printTime = ref('')

let timer = null

const statusText = (status) => {
  const map = { PENDING: '待确认', CONFIRMED: '已接单', PREPARING: '制作中', COMPLETED: '已完成' }
  return map[status] || status
}

const formatTime = (time) => {
  if (!time) return ''
  const t = new Date(time)
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
}

const unprintedOrders = computed(() => {
  return orders.value.filter(o => ['PENDING', 'CONFIRMED'].includes(o.status) && !o.kitchenPrinted)
})

const preparingOrders = computed(() => {
  return orders.value.filter(o => o.kitchenPrinted && ['CONFIRMED', 'PREPARING'].includes(o.status))
})

const loadData = async () => {
  try {
    const [orderList, tableList, dailyStats] = await Promise.all([
      getPendingOrders(),
      getTables(),
      getDailyStats()
    ])
    
    tables.value = tableList
    tableMap.value = {}
    tableList.forEach(t => { tableMap.value[t.id] = t })
    
    orders.value = orderList
    
    today.value = dailyStats.date
    stats.value = dailyStats
  } catch (e) {
    console.error(e)
  }
}

const printOrder = async (order) => {
  try {
    const { getOrder } = await import('@/api')
    const detail = await getOrder(order.orderNo)
    printOrderData.value = detail
    
    const now = new Date()
    const pad = n => n.toString().padStart(2, '0')
    printTime.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    
    printPopup.value = true
  } catch (e) {
    console.error(e)
  }
}

const doPrint = async () => {
  if (!printOrderData.value) return
  try {
    await markOrderPrinted(printOrderData.value.order.orderNo)
    await updateOrderStatus(printOrderData.value.order.orderNo, 'PREPARING')
    printPopup.value = false
    showToast('打印成功')
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const refresh = () => {
  loadData()
}

onMounted(() => {
  loadData()
  timer = setInterval(loadData, 15000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="less">
.kitchen-page {
  padding-top: 0;
}

.refresh-btn {
  font-size: 14px;
  color: #1989fa;
}

.order-list {
  padding: 10px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .order-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    
    .table-tag {
      background: #1989fa;
      color: #fff;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
    }
    
    .order-time {
      font-size: 12px;
      color: #999;
    }
  }
  
  .order-items {
    background: #f7f8fa;
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 10px;
  }
  
  .item-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 14px;
    
    .item-qty {
      color: #ff4d4f;
      font-weight: bold;
    }
  }
  
  .order-actions {
    text-align: right;
  }
}

.stats-page {
  padding: 10px;
  
  .section-title {
    padding: 10px 16px;
    font-size: 14px;
    color: #666;
    font-weight: bold;
  }
  
  .big {
    font-size: 20px;
  }
}

.print-content {
  width: 320px;
  padding: 20px;
  
  .print-header {
    text-align: center;
    margin-bottom: 15px;
    
    .shop-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .print-time {
      font-size: 12px;
      color: #666;
    }
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 13px;
  }
  
  .divider {
    border-top: 1px dashed #ccc;
    margin: 10px 0;
  }
  
  .items-table {
    width: 100%;
    font-size: 13px;
    
    th, td {
      text-align: left;
      padding: 4px 0;
    }
    
    th {
      border-bottom: 1px solid #eee;
    }
    
    tfoot td {
      border-top: 1px solid #eee;
      padding-top: 8px;
      font-weight: bold;
    }
  }
  
  .print-footer {
    text-align: center;
    font-size: 12px;
    color: #666;
    margin-top: 15px;
  }
  
  .print-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    
    button {
      flex: 1;
    }
  }
}
</style>
