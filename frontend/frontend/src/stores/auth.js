// src/stores/auth.js - исправленная версия
import { ref } from 'vue'
import { getMe } from '@/api'

export const user = ref(null)
export const loaded = ref(false)

export async function ensureUser() {
  // Изменённая проверка: пропускаем ТОЛЬКО если уже загружено И user существует
  if (loaded.value && user.value) return;
  
  const token = localStorage.getItem('access')
  
  // Если нет токена - просто завершаем
  if (!token) {
    loaded.value = true
    return
  }
  
  try {
    console.log('Пытаемся получить данные пользователя с /api/me/');
    const response = await getMe()
    console.log('Данные пользователя получены:', response.data);
    
    user.value = response.data
    
    // Определяем тип пользователя на основе ответа
    if (user.value.is_barista === true || user.value.is_staff === true) {
      localStorage.setItem('user_type', 'barista')
      console.log('Пользователь определен как бариста');
    } else {
      localStorage.setItem('user_type', 'customer')
      console.log('Пользователь определен как клиент');
    }
    
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error)
    console.error('URL запроса:', error.config?.url)
    console.error('Статус:', error.response?.status)
    console.error('Ответ:', error.response?.data)
    
    // Если ошибка 401 - токен невалиден, очищаем
    if (error.response?.status === 401 || error.response?.status === 404) {
      console.log('Очищаем невалидные токены');
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('user_type')
      user.value = null
    }
  } finally {
    loaded.value = true
    console.log('ensureUser завершен, loaded:', loaded.value);
  }
}

export function logout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user_type')
  user.value = null
  loaded.value = false
  console.log('Пользователь разлогинен');
}
