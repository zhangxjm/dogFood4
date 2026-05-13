<template>
  <div class="qrcode-page page">
    <van-nav-bar title="餐桌二维码" left-arrow @click-left="$router.back()" />
    
    <div class="content">
      <van-tabs v-model:active="activeTab">
        <van-tab title="单张打印">
          <van-cell-group inset class="picker-group">
            <van-field
              readonly
              label="选择餐桌"
              :value="selectedTable?.tableName || '点击选择'"
              placeholder="请选择餐桌"
              is-link
              @click="showTablePicker = true"
            />
          </van-cell-group>
          
          <div class="qr-display" v-if="selectedTable">
            <div class="qr-card">
              <div class="qr-header">扫码点餐</div>
              <div class="qr-img">
                <img v-if="selectedTable.qrcode" :src="selectedTable.qrcode" alt="二维码" />
                <van-loading v-else type="spinner" />
              </div>
              <div class="qr-footer">
                <div class="table-name">{{ selectedTable.tableName }}</div>
                <div class="table-no">桌号: {{ selectedTable.tableNo }}</div>
              </div>
            </div>
            
            <div class="actions">
              <van-button type="primary" block @click="printSingle">打印当前</van-button>
              <van-button type="default" block class="regenerate-btn" @click="regenerateQR">
                重新生成二维码
              </van-button>
            </div>
          </div>
        </van-tab>

        <van-tab title="批量打印">
          <div class="batch-info">
            共 {{ tables.length }} 张餐桌，点击下方按钮批量打印所有二维码
          </div>
          
          <van-button type="primary" block class="batch-btn" @click="printAll">
            打印所有餐桌二维码
          </van-button>
          
          <div class="tables-preview">
            <div class="preview-title">预览</div>
            <div class="qr-grid">
              <div
                v-for="table in tables"
                :key="table.id"
                class="mini-qr"
              >
                <div class="table-tag">{{ table.tableName }}</div>
                <img v-if="table.qrcode" :src="table.qrcode" alt="" class="mini-img" />
                <van-loading v-else type="spinner" size="20" />
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <van-popup v-model:show="showTablePicker" position="bottom">
      <van-picker
        :columns="tableColumns"
        title="选择餐桌"
        @confirm="onTableConfirm"
        @cancel="showTablePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast, showDialog } from 'vant'
import { getTables, regenerateQRCode } from '@/api'

const activeTab = ref(0)
const tables = ref([])
const selectedTable = ref(null)
const showTablePicker = ref(false)

const tableColumns = computed(() => {
  return tables.value.map(t => ({
    text: `${t.tableNo} - ${t.tableName}`,
    value: t.id
  }))
})

const loadTables = async () => {
  try {
    tables.value = await getTables()
    
    const cached = sessionStorage.getItem('selectedTable')
    if (cached) {
      const t = JSON.parse(cached)
      selectedTable.value = tables.value.find(item => item.id === t.id) || null
      sessionStorage.removeItem('selectedTable')
    }
    
    if (!selectedTable.value && tables.value.length > 0) {
      selectedTable.value = tables.value[0]
    }
  } catch (e) {
    console.error(e)
  }
}

const onTableConfirm = ({ selectedOptions }) => {
  const id = selectedOptions[0].value
  selectedTable.value = tables.value.find(t => t.id === id)
  showTablePicker.value = false
}

const regenerateQR = async () => {
  if (!selectedTable.value) return
  try {
    const updated = await regenerateQRCode(selectedTable.value.id)
    selectedTable.value = updated
    const idx = tables.value.findIndex(t => t.id === updated.id)
    if (idx >= 0) tables.value[idx] = updated
    showToast('已重新生成')
  } catch (e) {
    console.error(e)
  }
}

const printSingle = () => {
  if (!selectedTable.value) return
  const printWindow = window.open('', '_blank')
  printWindow.document.write(getPrintHTML([selectedTable.value]))
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}

const printAll = () => {
  if (tables.value.length === 0) {
    showToast('暂无餐桌')
    return
  }
  const printWindow = window.open('', '_blank')
  printWindow.document.write(getPrintHTML(tables.value))
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}

const getPrintHTML = (tableList) => {
  const items = tableList.map(t => `
    <div class="print-item">
      <div class="shop-title">扫码点餐</div>
      <img src="${t.qrcode}" alt="QR Code" class="qr-img" />
      <div class="table-info">
        <div class="table-name">${t.tableName}</div>
        <div class="table-no">桌号: ${t.tableNo}</div>
      </div>
    </div>
  `).join('')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>餐桌二维码</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          padding: 20px; 
          font-family: Arial, sans-serif;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
        }
        .print-item {
          width: 240px;
          padding: 20px;
          border: 2px dashed #333;
          text-align: center;
          page-break-inside: avoid;
        }
        .shop-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #1989fa;
        }
        .qr-img {
          width: 180px;
          height: 180px;
          margin: 0 auto;
        }
        .table-info {
          margin-top: 15px;
        }
        .table-name {
          font-size: 18px;
          font-weight: bold;
        }
        .table-no {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${items}
    </body>
    </html>
  `
}

onMounted(loadTables)
</script>

<style scoped lang="less">
.qrcode-page {
  padding-top: 0;
}

.content {
  padding-bottom: 20px;
}

.picker-group {
  margin: 10px;
}

.qr-display {
  padding: 20px;
  
  .qr-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    
    .qr-header {
      font-size: 20px;
      font-weight: bold;
      color: #1989fa;
      margin-bottom: 20px;
    }
    
    .qr-img {
      width: 240px;
      height: 240px;
      margin: 0 auto;
      background: #f5f5f5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        width: 100%;
        height: 100%;
      }
    }
    
    .qr-footer {
      margin-top: 20px;
      
      .table-name {
        font-size: 18px;
        font-weight: bold;
      }
      
      .table-no {
        font-size: 14px;
        color: #666;
        margin-top: 5px;
      }
    }
  }
  
  .actions {
    margin-top: 20px;
    
    .regenerate-btn {
      margin-top: 10px;
    }
  }
}

.batch-info {
  padding: 15px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.batch-btn {
  margin: 0 15px;
}

.tables-preview {
  padding: 15px;
  
  .preview-title {
    padding: 10px 0;
    font-size: 14px;
    color: #666;
    font-weight: bold;
  }
  
  .qr-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .mini-qr {
      width: calc(50% - 5px);
      background: #fff;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
      
      .table-tag {
        font-size: 12px;
        color: #666;
        margin-bottom: 5px;
      }
      
      .mini-img {
        width: 100px;
        height: 100px;
      }
    }
  }
}
</style>
