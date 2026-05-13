<script setup lang="ts">
import { ref, watch } from 'vue';
import { useBookmarkStore } from '../stores/bookmark';
import { useCategoryStore } from '../stores/category';
import type { CreateBookmarkDto } from '../types';

const bookmarkStore = useBookmarkStore();
const categoryStore = useCategoryStore();

const visible = ref(false);
const submitting = ref(false);
const form = ref<CreateBookmarkDto>({
  title: '',
  url: '',
  description: '',
  categoryId: '',
  tags: [],
});
const tagInput = ref('');

function open() {
  visible.value = true;
  resetForm();
}

function close() {
  visible.value = false;
  resetForm();
}

function resetForm() {
  form.value = {
    title: '',
    url: '',
    description: '',
    categoryId: '',
    tags: [],
  };
  tagInput.value = '';
}

function addTag() {
  const tag = tagInput.value.trim();
  if (tag && !form.value.tags?.includes(tag)) {
    form.value.tags = [...(form.value.tags || []), tag];
  }
  tagInput.value = '';
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags?.filter((t) => t !== tag) || [];
}

async function handleSubmit() {
  if (!form.value.title.trim() || !form.value.url.trim()) {
    alert('请填写标题和URL');
    return;
  }

  try {
    submitting.value = true;
    const data: CreateBookmarkDto = {
      title: form.value.title.trim(),
      url: form.value.url.trim(),
      description: form.value.description?.trim(),
      tags: form.value.tags,
    };
    if (form.value.categoryId) {
      data.categoryId = form.value.categoryId;
    }
    await bookmarkStore.createBookmark(data);
    close();
  } catch (error) {
    console.error('添加书签失败:', error);
    alert('添加失败，请重试');
  } finally {
    submitting.value = false;
  }
}

watch(() => useBookmarkStore().searchParams, () => {}, { immediate: true });

defineExpose({ open });
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">添加书签</h3>
          <button class="btn btn-icon btn-sm" @click="close">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">标题 *</label>
            <input v-model="form.title" type="text" class="input" placeholder="例如：GitHub" />
          </div>
          
          <div class="form-group">
            <label class="form-label">URL *</label>
            <input v-model="form.url" type="url" class="input" placeholder="https://github.com" />
          </div>
          
          <div class="form-group">
            <label class="form-label">分类</label>
            <select v-model="form.categoryId" class="select">
              <option value="">未分类</option>
              <option v-for="cat in categoryStore.categories" :key="cat._id" :value="cat._id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea v-model="form.description" class="textarea" placeholder="选填，简要描述..."></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">标签</label>
            <div class="tags-input-wrapper">
              <div v-for="tag in form.tags" :key="tag" class="tag-chip">
                #{{ tag }}
                <button type="button" class="tag-remove" @click="removeTag(tag)">✕</button>
              </div>
              <input
                v-model="tagInput"
                type="text"
                class="tags-input"
                placeholder="输入标签后按回车"
                @keydown.enter.prevent="addTag"
              />
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn" @click="close">取消</button>
          <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
            {{ submitting ? '添加中...' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tags-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  min-height: 42px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg-primary);
  border-radius: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-muted);
  padding: 0 2px;
  line-height: 1;
}

.tag-remove:hover {
  color: var(--text-primary);
}

.tags-input {
  flex: 1;
  min-width: 120px;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  padding: 4px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
