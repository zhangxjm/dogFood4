<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCategoryStore } from './stores/category';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import BookmarkList from './components/BookmarkList.vue';
import AddBookmarkModal from './components/AddBookmarkModal.vue';
import AddCategoryModal from './components/AddCategoryModal.vue';

const categoryStore = useCategoryStore();
const bookmarkModalRef = ref<InstanceType<typeof AddBookmarkModal> | null>(null);
const categoryModalRef = ref<InstanceType<typeof AddCategoryModal> | null>(null);

function handleOpenBookmarkModal() {
  bookmarkModalRef.value?.open();
}

function handleOpenCategoryModal() {
  categoryModalRef.value?.open();
}

onMounted(() => {
  categoryStore.fetchCategories();
});
</script>

<template>
  <div class="app-layout">
    <Header />
    <main class="main-container">
      <Sidebar
        @open-bookmark-modal="handleOpenBookmarkModal"
        @open-category-modal="handleOpenCategoryModal"
      />
      <section class="content-area">
        <BookmarkList />
      </section>
    </main>
    <AddBookmarkModal ref="bookmarkModalRef" />
    <AddCategoryModal ref="categoryModalRef" />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
  gap: 20px;
}

.content-area {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }
}
</style>
