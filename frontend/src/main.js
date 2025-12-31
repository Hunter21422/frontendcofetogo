// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { ensureUser } from "@/stores/auth"

// Создаём приложение Vue
const app = createApp(App)

// Подключаем роутер
app.use(router)

// Монтируем приложение
app.mount("#app")

// Инициализация Telegram Web App (если запущено внутри Telegram)
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp

  // Сообщаем Telegram, что приложение готово
  tg.ready()

  // Разворачиваем приложение на весь экран (рекомендуется для Mini Apps)
  tg.expand()

  // Опционально: скрываем основную кнопку Telegram (если используете свою навигацию)
  // tg.MainButton.hide()

  // Можно получить и сохранить initData сразу
  if (tg.initData) {
    localStorage.setItem('tg_init_data', tg.initData)
    console.log('Telegram initData сохранён')
  }

  // Применяем тему Telegram (опционально, но красиво)
  const theme = tg.themeParams
  if (theme.bg_color) {
    document.documentElement.style.setProperty('--tg-bg-color', theme.bg_color)
    document.documentElement.style.setProperty('--tg-text-color', theme.text_color)
    document.documentElement.style.setProperty('--tg-button-color', theme.button_color)
    // и другие переменные по желанию
  }
}

// Загружаем данные пользователя (обычный логин или Telegram)
ensureUser()

// Слушаем событие изменения авторизации (если где-то в приложении оно вызывается)
window.addEventListener('auth-changed', ensureUser)

// Дополнительно: обработка закрытия приложения (опционально)
window.Telegram?.WebApp?.onEvent('viewportChanged', () => {
  console.log('Viewport changed')
})
