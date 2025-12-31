// src/stores/auth.js — финальная версия для Telegram Mini App
import { ref } from 'vue'
import { getMe, telegramAuth } from '@/api'

export const user = ref(null)
export const loaded = ref(false)
export const isTelegram = ref(!!window.Telegram?.WebApp)

/**
 * Загружает данные пользователя:
 * 1. Сначала пытается авторизоваться через Telegram (если запущено в Mini App)
 * 2. Если Telegram нет или не удалось — проверяет обычный JWT токен
 */
export async function ensureUser() {
  // Если уже загружено и есть пользователь — ничего не делаем
  if (loaded.value && user.value) return

  // Помечаем, что загрузка началась
  loaded.value = false

  // === 1. Попытка авторизации через Telegram ===
  if (isTelegram.value) {
    const initData = localStorage.getItem('tg_init_data')
    if (initData && !localStorage.getItem('access')) {
      try {
        console.log('Пытаемся авторизоваться через Telegram...')
        const response = await telegramAuth()
        localStorage.setItem('access', response.data.access)
        if (response.data.refresh) {
          localStorage.setItem('refresh', response.data.refresh)
        }
        console.log('Успешная авторизация через Telegram')
      } catch (error) {
        console.warn('Telegram auth не удался (возможно, пользователь не зарегистрирован)', error)
        // Не очищаем initData — может понадобиться для регистрации позже
      }
    }
  }

  // === 2. Проверка обычного JWT токена ===
  const token = localStorage.getItem('access')
  if (!token) {
    loaded.value = true
    return
  }

  try {
    console.log('Пытаемся получить данные пользователя через /api/me/')
    const response = await getMe()
    user.value = response.data

    // Определяем роль и сохраняем в localStorage
    if (user.value.is_barista || user.value.is_staff) {
      localStorage.setItem('user_type', 'barista')
    } else {
      localStorage.setItem('user_type', 'customer')
    }

    console.log('Пользователь загружен:', user.value.username, '(тип:', localStorage.getItem('user_type') + ')')
  } catch (error) {
    console.error('Ошибка при загрузке профиля:', error.response?.status, error.response?.data)

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Токен недействителен — очищаем данные')
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('user_type')
      user.value = null
    }
  } finally {
    loaded.value = true
    console.log('ensureUser завершён')
  }
}

/**
 * Полный логаут
 */
export function logout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user_type')
  localStorage.removeItem('view_mode')
  localStorage.removeItem('tg_init_data') // Важно для Telegram

  user.value = null
  loaded.value = false

  console.log('Пользователь полностью разлогинен')

  // Редирект на логин, если не там
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Автоматический вызов при загрузке приложения (можно оставить в main.js)
ensureUser()
