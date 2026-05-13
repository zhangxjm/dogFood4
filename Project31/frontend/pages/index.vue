<template>
  <div class="home-page">
    <header class="header">
      <div class="container header-content">
        <h1 class="title">我的云端相册</h1>
        <button class="btn btn-primary" @click="openCreateModal">
          + 创建相册
        </button>
      </div>
    </header>

    <main class="main container">
      <div v-if="loading" class="loading">
        加载中...
      </div>

      <div v-else-if="albums.length === 0" class="empty-state">
        <div class="empty-icon">🖼️</div>
        <h2>还没有相册</h2>
        <p>点击上方按钮创建你的第一个相册</p>
      </div>

      <div v-else class="album-grid">
        <div
          v-for="album in albums"
          :key="album._id"
          class="album-card card"
          @click="goToAlbum(album._id)"
        >
          <div class="album-cover">
            <div v-if="album.coverPhotoUrl" class="cover-image-wrapper">
              <img
                :src="'http://localhost:3001' + album.coverPhotoUrl"
                :alt="album.name"
                class="cover-image"
              />
            </div>
            <div v-else class="cover-placeholder">
              <span class="placeholder-icon">📁</span>
            </div>
          </div>
          <div class="album-info">
            <h3 class="album-name">{{ album.name }}</h3>
            <p class="album-count">{{ album.photoCount }} 张照片</p>
            <p v-if="album.description" class="album-desc">{{ album.description }}</p>
            <button
              class="btn btn-danger delete-btn"
              @click.stop="confirmDelete(album)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal">
        <h2 class="modal-title">创建新相册</h2>
        <form @submit.prevent="createNewAlbum">
          <div class="form-group">
            <label for="albumName">相册名称</label>
            <input
              id="albumName"
              v-model="newAlbum.name"
              type="text"
              placeholder="请输入相册名称"
              required
            />
          </div>
          <div class="form-group">
            <label for="albumDesc">描述（可选）</label>
            <textarea
              id="albumDesc"
              v-model="newAlbum.description"
              placeholder="简单描述这个相册"
              rows="3"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeCreateModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? '创建中...' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal">
        <h2 class="modal-title">确认删除</h2>
        <p>
          确定要删除相册 "<strong>{{ albumToDelete ? albumToDelete.name : '' }}</strong>" 吗？
          这将删除相册中的所有照片，此操作不可恢复。
        </p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeDeleteModal">
            取消
          </button>
          <button class="btn btn-danger" @click="deleteAlbum" :disabled="deleting">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const { getAlbums, createAlbum, deleteAlbum: deleteAlbumApi } = useApi()

const loading = ref(true)
const albums = ref([])
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const albumToDelete = ref(null)
const creating = ref(false)
const deleting = ref(false)
const newAlbum = ref({
  name: '',
  description: ''
})

const loadAlbums = async () => {
  try {
    loading.value = true
    const data = await getAlbums()
    albums.value = data
  } catch (error) {
    console.error('Failed to load albums:', error)
  } finally {
    loading.value = false
  }
}

const createNewAlbum = async () => {
  try {
    creating.value = true
    await createAlbum(newAlbum.value.name, newAlbum.value.description)
    closeCreateModal()
    newAlbum.value = { name: '', description: '' }
    await loadAlbums()
  } catch (error) {
    console.error('Failed to create album:', error)
    alert('创建相册失败')
  } finally {
    creating.value = false
  }
}

const confirmDelete = (album) => {
  albumToDelete.value = album
  showDeleteModal.value = true
}

const deleteAlbum = async () => {
  if (!albumToDelete.value) return
  
  try {
    deleting.value = true
    await deleteAlbumApi(albumToDelete.value._id)
    closeDeleteModal()
    albumToDelete.value = null
    await loadAlbums()
  } catch (error) {
    console.error('Failed to delete album:', error)
    alert('删除相册失败')
  } finally {
    deleting.value = false
  }
}

const goToAlbum = (id) => {
  router.push('/album/' + id)
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

onMounted(() => {
  loadAlbums()
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

.title {
  color: white;
  font-size: 28px;
  font-weight: 600;
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

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.album-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.album-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.album-cover {
  aspect-ratio: 4/3;
  background-color: #f0f0f0;
  overflow: hidden;
}

.cover-image-wrapper {
  width: 100%;
  height: 100%;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
}

.placeholder-icon {
  font-size: 64px;
}

.album-info {
  padding: 16px;
  position: relative;
}

.album-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.album-count {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.album-desc {
  font-size: 14px;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.delete-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  font-size: 12px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
