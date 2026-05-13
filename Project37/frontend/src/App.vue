<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <h1 class="logo" @click="$router.push('/')">校园二手市场</h1>
        <nav>
          <router-link to="/" class="nav-link" exact-active-class="active">首页</router-link>
          <router-link to="/add" class="nav-link">发布物品</router-link>
        </nav>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 校园二手市场 - 让闲置物品流转起来</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.logo {
  margin: 0;
  font-size: 1.8rem;
  cursor: pointer;
  font-weight: bold;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
}

.main-content {
  min-height: calc(100vh - 180px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.footer {
  background: #333;
  color: #fff;
  text-align: center;
  padding: 1.5rem 0;
  margin-top: 2rem;
}

.footer .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
