<template>
  <div class="home">
    <div class="add-form">
      <h3>添加新心愿</h3>
      <input v-model="newWish.title" placeholder="心愿标题" class="input" />
      <textarea
        v-model="newWish.description"
        placeholder="详细描述（可选）"
        class="input textarea"
      ></textarea>
      <div class="form-row">
        <input
          v-model="newWish.category"
          placeholder="分类（如：学习、旅行、生活）"
          class="input"
        />
        <button @click="addWish" class="btn add-btn">添加</button>
      </div>
    </div>

    <div class="filters">
      <select v-model="selectedCategory" class="input">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>

    <div class="wish-list">
      <div v-if="wishes.length === 0" class="empty">
        <p>还没有心愿，添加一个吧！</p>
      </div>
      <div v-for="wish in filteredWishes" :key="wish._id" class="wish-item">
        <div class="wish-content">
          <input
            type="checkbox"
            :checked="wish.completed"
            @change="toggleComplete(wish)"
            class="checkbox"
          />
          <div>
            <h4 class="wish-title">{{ wish.title }}</h4>
            <p v-if="wish.description" class="wish-desc">
              {{ wish.description }}
            </p>
            <div class="wish-meta">
              <span class="category">{{ wish.category }}</span>
              <span class="date">{{ formatDate(wish.createdAt) }}</span>
            </div>
          </div>
        </div>
        <button @click="deleteWish(wish._id)" class="btn delete-btn">
          删除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  getWishes as fetchWishes,
  getCategories as fetchCategories,
  createWish as apiCreateWish,
  updateWish as apiUpdateWish,
  deleteWish as apiDeleteWish,
} from "../api/wishes";

const wishes = ref([]);
const categories = ref([]);
const selectedCategory = ref("");
const newWish = ref({ title: "", description: "", category: "" });

const filteredWishes = computed(() => {
  let result = wishes.value.filter((w) => !w.completed);
  if (selectedCategory.value) {
    result = result.filter((w) => w.category === selectedCategory.value);
  }
  return result;
});

async function loadWishes() {
  const data = await fetchWishes({ completed: "false" });
  wishes.value = data;
}

async function loadCategories() {
  const data = await fetchCategories();
  categories.value = data;
}

async function addWish() {
  if (!newWish.value.title.trim()) return;
  await apiCreateWish(newWish.value);
  newWish.value = { title: "", description: "", category: "" };
  await loadWishes();
  await loadCategories();
}

async function toggleComplete(wish) {
  await apiUpdateWish(wish._id, { completed: !wish.completed });
  await loadWishes();
}

async function deleteWish(id) {
  await apiDeleteWish(id);
  await loadWishes();
  await loadCategories();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN");
}

onMounted(() => {
  loadWishes();
  loadCategories();
});
</script>

<style scoped>
.add-form {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.add-form h3 {
  color: #333;
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 10px;
}

.input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
}

.textarea {
  height: 80px;
  resize: vertical;
}

.filters {
  margin-bottom: 20px;
}

.filters .input {
  max-width: 200px;
}

.wish-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
  margin-bottom: 10px;
  transition: background 0.3s;
}

.wish-item:hover {
  background: #f0f0f0;
}

.wish-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.checkbox {
  width: 20px;
  height: 20px;
  margin-top: 4px;
  cursor: pointer;
}

.wish-title {
  color: #333;
  margin-bottom: 5px;
}

.wish-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.wish-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 10px;
  border-radius: 12px;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  white-space: nowrap;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.delete-btn {
  background: #ffebee;
  color: #e53935;
}

.delete-btn:hover {
  background: #ffcdd2;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
