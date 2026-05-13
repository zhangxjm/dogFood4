<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useBookmarkStore } from '../stores/bookmark';
import { useCategoryStore } from '../stores/category';
import type { Bookmark, UpdateBookmarkDto } from '../types';

const props = defineProps<{
  bookmark: Bookmark;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const bookmarkStore = useBookmarkStore();
const categoryStore = useCategoryStore();

const submitting = ref(false);
const form = ref<UpdateBookmarkDto & { tagsInput: string }>({
  title: '',
  url: '',
  description: '',
  categoryId: '',
  tags: [],
  tagsInput: '',
});

function getCategoryId(): string {
  if (!props.bookmark.categoryId) return '';
  if (typeof props.bookmark.categoryId === 'string') return props.bookmark.categoryId;
  return props.bookmark.categoryId._id;
}

function initForm() {
  form.value = {
    title: props.bookmark.title,
    url: props.bookmark.url,
    description: props.bookmark.description,
    categoryId: getCategoryId(),
    tags: [...props.bookmark.tags],
    tagsInput: '',
  };
}

function addTag() {
  const tag = form.value.tagsInput?.trim();
  if (tag && !form.value.tags?.includes(tag)) {
    form.value.tags = [...(form.value.tags || []), tag];
  }
  form.value.tagsInput = '';
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags?.filter((t) => t !== tag) || [];
}

async function handleSubmit() {
  if (!form.value.title?.trim() || !form.value.url?.trim()) {
    alert('请填写标题和URL');
    return;
  }

  try {
    submitting.value = true;
    const data: UpdateBookmarkDto = {
      title: form.value.title?.trim(),
      url: form.value.url?.trim(),
      description: form.value.description?.trim(),
      tags: form.value.tags,
    };
    if (form.value.categoryId) {
      data.categoryId = form.value.categoryId;
    }
    await bookmarkStore.updateBookmark(props.bookmark._id, data);
    emit('close');
  } catch (error) {
    console.error('更新书签失败:', error);
    alert('更新失败，请重试');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  initForm();
});

watch(() => props.bookmark, initForm);
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">编辑书签</h3>
          <button class="btn btn-icon btn-sm" @click="emit('close')">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">标题 *</label>
            <input v-model="form.title" type="text" class="input" />
          </div>
          
          <div class="form-group">
            <label class="form-label">URL *</label>
            <input v-model="form.url" type="url" class="input" />
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
            <textarea v-model="form.description" class="textarea"></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">标签</label>
            <div class="tags-input-wrapper">
              <div v-for="tag in form.tags" :key="tag" class="tag-chip">
                #{{ tag }}
                <button type="button" class="tag-remove" @click="removeTag(tag)">✕</button>
              </div>
              <input
                v-model="form.tagsInput"
                type="text"
                class="tags-input"
                placeholder="输入标签后按回车"
                @keydown.enter.prevent="addTag"
              />
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn" @click="emit('close')">取消</button>
          <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
            {{ submitting ? '保存中...' : '保存' }}
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
