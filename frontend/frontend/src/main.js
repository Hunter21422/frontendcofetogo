// main.js
import { createApp } from 'vue'  // ← ДОБАВЬ ЭТУ СТРОКУ!
import App from './App.vue'
import router from './router'
import { ensureUser } from "@/stores/auth"

// Создаем приложение
const app = createApp(App)

// Подключаем роутер
app.use(router)

// Если используешь Vuex:
// import store from './store'
// app.use(store)

// Монтируем приложение
app.mount("#app")

// Загружаем пользователя
ensureUser()

window.addEventListener('auth-changed', ensureUser);
