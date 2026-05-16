<template>
  <div class="card mb-4 article-card">
    <div class="row g-0">
      <div class="col-md-4" v-if="article.cover_image">
        <img :src="article.cover_image" class="img-fluid rounded-start" :alt="article.title">
      </div>
      <div :class="article.cover_image ? 'col-md-8' : 'col-12'">
        <div class="card-body">
          <h5 class="card-title">
            <router-link :to="`/article/${article.id}`" class="text-decoration-none text-reset">
              {{ article.title }}
            </router-link>
          </h5>
          <p class="card-text">
            <small class="text-muted">
              {{ article.created_at ? formatDate(article.created_at) : '' }}
              <span v-if="article.category" class="ms-2">
                分类: <router-link :to="`/category/${article.category.slug}`" class="text-decoration-none">
                  {{ article.category.name }}
                </router-link>
              </span>
            </small>
          </p>
          <p class="card-text">{{ article.excerpt }}</p>
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span v-for="tag in article.tags" :key="tag.id" class="badge bg-secondary me-1">
                <router-link :to="`/tag/${tag.slug}`" class="text-white text-decoration-none">
                  {{ tag.name }}
                </router-link>
              </span>
            </div>
            <div class="text-muted small">
              <span>👁️ {{ article.views || 0 }}</span>
              <span class="ms-2">💬 {{ article.comment_count || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  article: {
    type: Object,
    required: true
  }
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.article-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
