<template>
  <div class="product-page">
    <van-nav-bar title="商品管理">
      <template #right>
        <van-icon name="plus" size="22" @click="showAddPopup = true" />
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="loadProducts">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadProducts">
        <div v-for="product in products" :key="product._id" class="product-card">
          <div class="product-info">
            <div class="product-header">
              <span class="product-name">{{ product.name }}</span>
              <van-switch v-model="product.isActive" size="20" @change="toggleProductStatus(product)" />
            </div>
            <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
            <div v-if="product.category" class="product-category">{{ product.category }}</div>
            <div v-if="product.description" class="product-desc">{{ product.description }}</div>
            <div class="product-sales">已售 {{ product.salesCount }} 份</div>
          </div>
          <div class="product-actions">
            <van-button type="primary" size="small" plain @click="editProduct(product)">编辑</van-button>
            <van-button type="danger" size="small" plain @click="confirmDelete(product)">删除</van-button>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <van-popup v-model:show="showAddPopup" round position="bottom" :style="{ height: '80%' }">
      <div class="product-form">
        <van-nav-bar
          :title="editingProduct ? '编辑商品' : '添加商品'"
          left-text="取消"
          right-text="保存"
          @click-left="closePopup"
          @click-right="saveProduct"
        />
        <van-form @submit="saveProduct">
          <van-field v-model="form.name" label="商品名称" placeholder="请输入商品名称" required />
          <van-field v-model="form.price" label="商品价格" type="number" placeholder="请输入价格" required />
          <van-field v-model="form.category" label="商品分类" placeholder="请输入分类（可选）" />
          <van-field v-model="form.description" label="商品描述" type="textarea" placeholder="请输入描述（可选）" />
          <van-field v-model="form.sortOrder" label="排序序号" type="number" placeholder="数字越小越靠前" />
          <van-field name="isActive" label="上架状态">
            <template #input>
              <van-switch v-model="form.isActive" size="20" />
            </template>
          </van-field>
        </van-form>
      </div>
    </van-popup>

    <van-dialog v-model:show="showDeleteDialog" title="确认删除" message="确定要删除这个商品吗？" @confirm="deleteProduct" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { productApi } from '../utils/request';

const products = ref([]);
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const showAddPopup = ref(false);
const showDeleteDialog = ref(false);
const editingProduct = ref(null);
const deletingProduct = ref(null);

const form = ref({
  name: '',
  price: '',
  category: '',
  description: '',
  sortOrder: 0,
  isActive: true,
});

const loadProducts = async () => {
  try {
    const data = await productApi.getAll();
    products.value = data;
    finished.value = true;
  } catch (error) {
    console.error('加载商品失败:', error);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

const toggleProductStatus = async (product) => {
  try {
    await productApi.update(product._id, { isActive: product.isActive });
    showToast({ type: 'success', message: product.isActive ? '已上架' : '已下架' });
  } catch (error) {
    product.isActive = !product.isActive;
  }
};

const editProduct = (product) => {
  editingProduct.value = product;
  form.value = {
    name: product.name,
    price: product.price,
    category: product.category || '',
    description: product.description || '',
    sortOrder: product.sortOrder || 0,
    isActive: product.isActive,
  };
  showAddPopup.value = true;
};

const closePopup = () => {
  showAddPopup.value = false;
  editingProduct.value = null;
  form.value = {
    name: '',
    price: '',
    category: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  };
};

const saveProduct = async () => {
  if (!form.value.name) {
    showToast({ type: 'fail', message: '请输入商品名称' });
    return;
  }
  if (!form.value.price) {
    showToast({ type: 'fail', message: '请输入商品价格' });
    return;
  }

  try {
    const productData = {
      ...form.value,
      price: Number(form.value.price),
      sortOrder: Number(form.value.sortOrder),
    };

    if (editingProduct.value) {
      await productApi.update(editingProduct.value._id, productData);
      showToast({ type: 'success', message: '修改成功' });
    } else {
      await productApi.create(productData);
      showToast({ type: 'success', message: '添加成功' });
    }

    closePopup();
    loadProducts();
  } catch (error) {
    console.error('保存商品失败:', error);
  }
};

const confirmDelete = (product) => {
  deletingProduct.value = product;
  showDeleteDialog.value = true;
};

const deleteProduct = async () => {
  try {
    await productApi.delete(deletingProduct.value._id);
    showToast({ type: 'success', message: '删除成功' });
    loadProducts();
  } catch (error) {
    console.error('删除商品失败:', error);
  }
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.product-page {
  padding-bottom: 20px;
}

.product-card {
  margin: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.product-info {
  margin-bottom: 12px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-name {
  font-size: 17px;
  font-weight: 600;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6034;
  margin-bottom: 4px;
}

.product-category {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  background: #f2f3f5;
  color: #666;
  border-radius: 4px;
  margin-bottom: 4px;
}

.product-desc {
  font-size: 13px;
  color: #969799;
  margin-bottom: 4px;
}

.product-sales {
  font-size: 12px;
  color: #c8c9cc;
}

.product-actions {
  display: flex;
  gap: 12px;
}

.product-form {
  height: 100%;
}
</style>
