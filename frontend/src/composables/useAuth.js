// src/composables/useAuth.js — исправленная версия
import { ref, readonly } from "vue";
import api from "@/api";

const user = ref(null);
const loaded = ref(false);

// Загружаем сразу при первом вызове
export function useAuth() {
  if (!loaded.value) {
    ensureUser();
  }

  async function ensureUser() {
    if (loaded.value) return;

    const access = localStorage.getItem("access");
    if (!access) {
      loaded.value = true;
      return;
    }

    try {
      api.defaults.headers.Authorization = `Bearer ${access}`;
      const { data } = await api.get("/api/me/");
      user.value = data;
    } catch (e) {
      console.warn("Ошибка загрузки профиля:", e);
      user.value = null;
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    } finally {
      loaded.value = true;
    }
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    user.value = null;
    loaded.value = false;
    delete api.defaults.headers.Authorization;
  }

  return {
    user: readonly(user),
    loaded: readonly(loaded),
    ensureUser,
    logout,
  };
}
