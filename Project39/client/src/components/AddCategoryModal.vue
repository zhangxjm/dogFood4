<script setup lang="ts">
import { ref } from 'vue';
import { useCategoryStore } from '../stores/category';
import type { CreateCategoryDto } from '../types';

const categoryStore = useCategoryStore();

const visible = ref(false);
const submitting = ref(false);
const form = ref<CreateCategoryDto>({
  name: '',
  description: '',
  color: '#3b82f6',
});

const colorOptions = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b',
];

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
    name: '',
    description: '',
    color: '#3b82f6',
  };
}

async function handleSubmit() {
  if (!form.value.name.trim()) {
    alert('请输入分类名称');
    return;
  }

  try {
    submitting.value = true;
    await categoryStore.createCategory({
      name: form.value.name.trim(),
      description: form.value.description?.trim(),
      color: form.value.color,
    });
    close();
  } catch (error: any) {
    console.error('添加分类失败:', error);
    const message = error?.response?.data?.message || '添加失败，请重试';
    alert(message);
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">添加分类</h3>
          <button class="btn btn-icon btn-sm" @click="close">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">名称 *</label>
            <input v-model="form.name" type="text" class="input" placeholder="例如：工作、学习、生活" />
          </div>
          
          <div class="form-group">
            <label class="form-label">颜色</label>
            <div class="color-picker">
              <button
                v-for="color in colorOptions"
                :key="color"
                type="button"
                class="color-option"
                :class="{ active: form.color === color }"
                :style="{ backgroundColor: color }"
                @click="form.color = color"
              >
                <span v-if="form.color === color" class="check">✓</span>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea v-model="form.description" class="textarea" placeholder="选填，分类描述..."></textarea>
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
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  box-shadow: 0 0 0 3px var(--bg-primary), 0 0 0 5px currentColor;
}

.check {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
