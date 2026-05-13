<template>
  <div class="app">
    <header class="header">
      <h1>✨ 我的心愿清单</h1>
      <nav class="nav">
        <router-link to="/" class="nav-link">待完成</router-link>
        <router-link to="/completed" class="nav-link">已完成</router-link>
      </nav>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup></script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.nav {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 10px 25px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  transition: all 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.main {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}
</style>
