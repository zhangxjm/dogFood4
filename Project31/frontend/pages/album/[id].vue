<template>
  <div class="album-page">
    <header class="header">
      <div class="container header-content">
        <div class="header-left">
          <button class="back-btn" @click="goBack">
            ← 返回
          </button>
          <div class="album-header-info">
            <h1 class="title">{{ album ? album.name : '加载中...' }}</h1>
            <p v-if="album && album.description" class="album-desc">{{ album.description }}</p>
            <p class="photo-count">{{ photos.length }} 张照片</p>
          </div>
        </div>
        <button class="btn btn-primary" @click="openUploadModal">
          + 上传图片
        </button>
      </div>
    </header>

    <main class="main container">
      <div v-if="loading" class="loading">
        加载中...
      </div>

      <div v-else-if="photos.length === 0" class="empty-state">
        <div class="empty-icon">📷</div>
        <h2>相册为空</h2>
        <p>点击上方按钮上传照片</p>
      </div>

      <div v-else class="photo-grid">
        <div
          v-for="photo in photos"
          :key="photo._id"
          class="photo-card card"
        >
          <div class="photo-wrapper" @click="openPreview(photo)">
            <img
              :src="'http://localhost:3001' + photo.url"
              :alt="photo.originalName"
              class="photo-image"
            />
          </div>
          <div class="photo-info">
            <span class="photo-name">{{ photo.originalName }}</span>
            <button
              class="btn btn-danger delete-photo-btn"
              @click="confirmDeletePhoto(photo)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal">
        <h2 class="modal-title">上传图片</h2>
        <form @submit.prevent="handleUpload">
          <div class="form-group">
            <label for="photoInput">选择图片（可多选，最多20张）</label>
            <input
              id="photoInput"
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              @change="handleFileSelect"
              class="file-input"
            />
          </div>
          <div v-if="selectedFiles.length > 0" class="selected-files">
            <p>已选择 {{ selectedFiles.length }} 个文件：</p>
            <ul>
              <li v-for="(file, index) in selectedFiles" :key="index">
                {{ file.name }} ({{ formatFileSize(file.size) }})
              </li>
            </ul>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeUploadModal">
              取消
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="selectedFiles.length === 0 || uploading"
            >
              {{ uploading ? '上传中...' : '上传' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal">
        <h2 class="modal-title">确认删除</h2>
        <p>
          确定要删除图片 "<strong>{{ photoToDelete ? photoToDelete.originalName : '' }}</strong>" 吗？
          此操作不可恢复。
        </p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeDeleteModal">
            取消
          </button>
          <button class="btn btn-danger" @click="deletePhoto" :disabled="deleting">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showPreview" class="preview-overlay" @click.self="closePreview">
      <div class="preview-container">
        <button class="close-preview" @click="closePreview">×</button>
        <img
          :src="'http://localhost:3001' + (previewPhoto ? previewPhoto.url : '')"
          :alt="previewPhoto ? previewPhoto.originalName : ''"
          class="preview-image"
        />
        <div class="preview-info">
          <p class="preview-name">{{ previewPhoto ? previewPhoto.originalName : '' }}</p>
          <p class="preview-size">{{ formatFileSize(previewPhoto ? previewPhoto.size : 0) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { getAlbum, uploadPhotos, deletePhoto: deletePhotoApi } = useApi()

const albumId = computed(() => route.params.id)
const album = ref(null)
const photos = ref([])
const loading = ref(true)
const showUploadModal = ref(false)
const showDeleteModal = ref(false)
const showPreview = ref(false)
const uploading = ref(false)
const deleting = ref(false)
const selectedFiles = ref([])
const photoToDelete = ref(null)
const previewPhoto = ref(null)
const fileInput = ref(null)

const loadAlbum = async () => {
  try {
    loading.value = true
    const data = await getAlbum(albumId.value)
    album.value = data.album
    photos.value = data.photos
  } catch (error) {
    console.error('Failed to load album:', error)
    alert('加载相册失败')
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event) => {
  const input = event.target
  if (input.files) {
    selectedFiles.value = Array.from(input.files)
  }
}

const handleUpload = async () => {
  if (selectedFiles.value.length === 0) return

  try {
    uploading.value = true
    await uploadPhotos(albumId.value, selectedFiles.value)
    closeUploadModal()
    selectedFiles.value = []
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    await loadAlbum()
  } catch (error) {
    console.error('Failed to upload photos:', error)
    alert('上传图片失败')
  } finally {
    uploading.value = false
  }
}

const confirmDeletePhoto = (photo) => {
  photoToDelete.value = photo
  showDeleteModal.value = true
}

const deletePhoto = async () => {
  if (!photoToDelete.value) return

  try {
    deleting.value = true
    await deletePhotoApi(photoToDelete.value._id)
    closeDeleteModal()
    photoToDelete.value = null
    await loadAlbum()
  } catch (error) {
    console.error('Failed to delete photo:', error)
    alert('删除图片失败')
  } finally {
    deleting.value = false
  }
}

const openPreview = (photo) => {
  previewPhoto.value = photo
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  previewPhoto.value = null
}

const openUploadModal = () => {
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadAlbum()
})
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.album-header-info {
  color: white;
}

.title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.album-desc {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.photo-count {
  font-size: 14px;
  opacity: 0.8;
}

.main {
  padding: 32px 0;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #666;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.empty-state h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #333;
}

.empty-state p {
  color: #666;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.photo-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.photo-wrapper {
  aspect-ratio: 1;
  overflow: hidden;
  background-color: #f0f0f0;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-info {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photo-name {
  font-size: 13px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12px;
}

.delete-photo-btn {
  padding: 6px 12px;
  font-size: 12px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.file-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.selected-files {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.selected-files p {
  margin-bottom: 8px;
  font-weight: 500;
}

.selected-files ul {
  list-style: none;
  max-height: 150px;
  overflow-y: auto;
}

.selected-files li {
  padding: 4px 0;
  font-size: 13px;
  color: #666;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-preview {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 40px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 90vw;
  max-height: 75vh;
  object-fit: contain;
}

.preview-info {
  margin-top: 16px;
  text-align: center;
  color: white;
}

.preview-name {
  font-size: 16px;
  margin-bottom: 4px;
}

.preview-size {
  font-size: 14px;
  opacity: 0.8;
}
</style>
