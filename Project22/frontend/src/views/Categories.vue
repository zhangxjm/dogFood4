<template>
  <div class="categories-page">
    <van-nav-bar title="分类管理" fixed>
      <template #right>
        <van-button type="primary" size="small" @click="showAddDialog = true">添加分类</van-button>
      </template>
    </van-nav-bar>
    <div class="content" :style="{ paddingTop: '46px', paddingBottom: '50px' }">
      <van-empty v-if="categories.length === 0 && !loading" description="暂无分类" />
      <van-loading v-if="loading" class="loading" />

      <van-list v-if="categories.length > 0" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <van-cell-group inset>
          <van-cell
            v-for="(cat, index) in categories"
            :key="cat.id"
            is-link
            @click="editCategory(cat)"
          >
            <template #title>
              <div class="category-title">
                <span>{{ cat.name }}</span>
                <van-tag plain type="primary" size="mini">排序: {{ cat.sort_order }}</van-tag>
              </div>
            </template>
            <template #extra>
              <van-button
                type="danger"
                size="mini"
                plain
                @click.stop="deleteCategory(cat)"
              >
                删除
              </van-button>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>

      <van-dialog
        v-model:show="showAddDialog"
        :title="editingCategory ? '编辑分类' : '添加分类'"
        show-cancel-button
        @confirm="onConfirm"
      >
        <van-cell-group>
          <van-field
            v-model="form.name"
            label="分类名称"
            placeholder="请输入分类名称"
          />
          <van-field
            v-model.number="form.sort_order"
            type="digit"
            label="排序"
            placeholder="数字越小越靠前"
          />
        </van-cell-group>
      </van-dialog>
    </div>

    <van-tabbar v-model="activeFooter">
      <van-tabbar-item icon="shop-o" to="/dishes">菜品</van-tabbar-item>
      <van-tabbar-item icon="apps-o" to="/categories">分类</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { categoryApi } from '@/api'

const categories = ref([])
const loading = ref(false)
const finished = ref(false)
const showAddDialog = ref(false)
const editingCategory = ref(null)
const activeFooter = ref(1)

const form = reactive({
  name: '',
  sort_order: 0
})

const loadCategories = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const res = await categoryApi.list()
    categories.value = res.data
    finished.value = true
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const editCategory = (cat) => {
  editingCategory.value = cat
  form.name = cat.name
  form.sort_order = cat.sort_order
  showAddDialog.value = true
}

const deleteCategory = async (cat) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除分类「${cat.name}」吗？该分类下的菜品也会被删除。`
    })
    await categoryApi.delete(cat.id)
    showToast('删除成功')
    loadCategories()
  } catch (e) {
    if (e !== 'cancel') showToast('删除失败')
  }
}

const onConfirm = async () => {
  if (!form.name.trim()) {
    showToast('请输入分类名称')
    return
  }
  try {
    if (editingCategory.value) {
      await categoryApi.update(editingCategory.value.id, {
        name: form.name,
        sort_order: form.sort_order
      })
      showToast('修改成功')
    } else {
      await categoryApi.create({
        name: form.name,
        sort_order: form.sort_order
      })
      showToast('添加成功')
    }
    showAddDialog.value = false
    resetForm()
    loadCategories()
  } catch (e) {
    showToast(editingCategory.value ? '修改失败' : '添加失败')
  }
}

const resetForm = () => {
  editingCategory.value = null
  form.name = ''
  form.sort_order = 0
}

const onLoad = () => {
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  min-height: 100vh;
}

.loading {
  text-align: center;
  padding: 20px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
