JavaScript// src/composables/useTelegram.js
import { ref, computed } from 'vue'

const isTelegram = ref(!!window.Telegram?.WebApp)

const tgUser = computed(() => {
  if (!isTelegram.value) return null
  return window.Telegram.WebApp.initDataUnsafe?.user || null
})

export function useTelegram() {
  return {
    isTelegram: readonly(isTelegram),
    tgUser: readonly(tgUser),
  }
}
