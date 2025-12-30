<template>
  <div id="app">
    <!-- Используем компонент AppHeader -->
    <AppHeader />
    
    <!-- Основной контент -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Футер -->
    <footer class="footer">
      <p>© 2025 6Кофе. Система лояльности клиентов</p>
    </footer>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue';
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 20px;
}

.footer {
  background: #1e293b;
  color: #94a3b8;
  padding: 2rem 0;
  text-align: center;
  font-size: 0.9rem;
  margin-top: auto;
}
</style>
