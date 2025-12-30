// frontend/frontend/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname)
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})