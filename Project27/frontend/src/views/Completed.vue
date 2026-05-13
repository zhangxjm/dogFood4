<template>
  <div class="completed">
    <h2>已完成心愿</h2>

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
        <p>还没有完成的心愿</p>
      </div>
      <div v-for="wish in filteredWishes" :key="wish._id" class="wish-item">
        <div class="wish-content">
          <div class="check-icon">✓</div>
          <div>
            <h4 class="wish-title">{{ wish.title }}</h4>
            <p v-if="wish.description" class="wish-desc">
              {{ wish.description }}
            </p>
            <div class="wish-meta">
              <span class="category">{{ wish.category }}</span>
              <span class="date">创建于 {{ formatDate(wish.createdAt) }}</span>
              <span class="completed-date"
                >完成于 {{ formatDate(wish.completedAt) }}</span
              >
            </div>
          </div>
        </div>
        <button @click="undoComplete(wish)" class="btn undo-btn">撤销</button>
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
  updateWish as apiUpdateWish,
  deleteWish as apiDeleteWish,
} from "../api/wishes";

const wishes = ref([]);
const categories = ref([]);
const selectedCategory = ref("");

const filteredWishes = computed(() => {
  if (!selectedCategory.value) return wishes.value;
  return wishes.value.filter((w) => w.category === selectedCategory.value);
});

async function loadWishes() {
  const data = await fetchWishes({ completed: "true" });
  wishes.value = data;
}

async function loadCategories() {
  const data = await fetchCategories();
  categories.value = data;
}

async function undoComplete(wish) {
  await apiUpdateWish(wish._id, { completed: false });
  await loadWishes();
}

async function deleteWish(id) {
  await apiDeleteWish(id);
  await loadWishes();
  await loadCategories();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN");
}

onMounted(() => {
  loadWishes();
  loadCategories();
});
</script>

<style scoped>
.completed h2 {
  color: #333;
  margin-bottom: 20px;
}

.filters {
  margin-bottom: 20px;
}

.input {
  max-width: 200px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.wish-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: #e8f5e9;
  border-radius: 10px;
  margin-bottom: 10px;
  opacity: 0.9;
}

.wish-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.check-icon {
  width: 24px;
  height: 24px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.wish-title {
  color: #333;
  text-decoration: line-through;
  margin-bottom: 5px;
}

.wish-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.wish-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.category {
  background: #c8e6c9;
  color: #2e7d32;
  padding: 2px 10px;
  border-radius: 12px;
}

.completed-date {
  color: #4caf50;
  font-weight: 500;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  margin-left: 10px;
}

.undo-btn {
  background: #fff3e0;
  color: #f57c00;
}

.undo-btn:hover {
  background: #ffe0b2;
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
