import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/articles',
    name: 'Articles',
    component: () => import('../views/Articles.vue')
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetail.vue')
  },
  {
    path: '/category/:slug',
    name: 'CategoryArticles',
    component: () => import('../views/Articles.vue')
  },
  {
    path: '/tag/:slug',
    name: 'TagArticles',
    component: () => import('../views/Articles.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'articles',
        name: 'AdminArticles',
        component: () => import('../views/admin/Articles.vue')
      },
      {
        path: 'article/new',
        name: 'NewArticle',
        component: () => import('../views/admin/ArticleEdit.vue')
      },
      {
        path: 'article/:id/edit',
        name: 'EditArticle',
        component: () => import('../views/admin/ArticleEdit.vue')
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../views/admin/Categories.vue')
      },
      {
        path: 'tags',
        name: 'AdminTags',
        component: () => import('../views/admin/Tags.vue')
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('../views/admin/Comments.vue')
      },
      {
        path: 'stats',
        name: 'AdminStats',
        component: () => import('../views/admin/Stats.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
