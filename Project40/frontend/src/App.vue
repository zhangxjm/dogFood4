<template>
  <div id="app">
    <nav class="navbar">
      <ul>
        <li 
          v-for="item in navItems" 
          :key="item.path"
          :class="{ active: currentRoute === item.path }"
          @click="navigateTo(item.path)"
        >
          {{ item.name }}
        </li>
      </ul>
    </nav>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      navItems: [
        { path: '/products', name: '商品管理' },
        { path: '/categories', name: '分类管理' }
      ]
    }
  },
  computed: {
    currentRoute() {
      return this.$route.path
    }
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path)
    }
  }
}
</script>
