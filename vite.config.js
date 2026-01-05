// vite.config.js
// Положить в корень репозитория (или в frontend/, если вся структура внутри frontend/)

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  // Алиасы для удобного импорта (уже хорошо, оставляем)
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname)
    }
  },

  // Настройки сервера разработки
  server: {
    port: 5173,
    host: true,          // Доступ по локальной сети (полезно для тестирования на телефоне)
    open: true,          // Автоматически открывать браузер
    cors: true           // Разрешаем CORS (нужно для запросов к backend)
  },

  // Настройки сборки (очень важно для Vercel/Netlify)
  build: {
    outDir: 'dist',      // Папка сборки (Vercel по умолчанию ищет dist)
    emptyOutDir: true,   // Очищать dist перед каждой сборкой
    sourcemap: false,    // Отключаем sourcemap в продакшене (меньше размер)
    minify: 'esbuild',   // Быстрая минификация
    target: 'es2020'     // Современный target (Vue 3 + Vite хорошо работают с этим)
  },

  // База для деплоя (важно для Vercel, GitHub Pages и т.д.)
  base: '/',             // Если деплоишь в корень домена — оставь '/'
                         // Если в поддиректорию (например /app/) — измени на '/app/'

  // Оптимизация (опционально, но полезно)
  optimizeDeps: {
    include: ['vue', 'vue-router', 'axios']
  }
})
