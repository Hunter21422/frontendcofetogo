// src/api.js — финальная версия для Telegram Mini App
import axios from "axios";

// Базовый URL backend (замени на свой, если нужно)
const API_BASE = process.env.VUE_APP_API_BASE || "https://backendloyalitysystem.onrender.com";

// Основной экземпляр axios — baseURL уже включает /api/
export const api = axios.create({
  baseURL: `${API_BASE}/api/`,
  withCredentials: false,
});

// === Интерцептор запросов: добавляем Bearer токен + Telegram initData ===
api.interceptors.request.use((config) => {
  // Пропускаем авторизацию для запросов с флагом __noAuth
  if (config.__noAuth) {
    delete config.headers.Authorization;
    return config;
  }

  // Добавляем JWT токен
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Добавляем Telegram initData (если есть) — для валидации на backend
  const tgInitData = localStorage.getItem("tg_init_data");
  if (tgInitData) {
    config.headers["X-Telegram-Init-Data"] = tgInitData;
  }

  return config;
});

// === Интерцептор ответов: обновление токена при 401 ===
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh");

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh);

        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ==========================
// ===   АУТЕНТИФИКАЦИЯ   ===
// ==========================

export const loginJWT = (payload) =>
  api.post("token/", payload, { __noAuth: true });

export const loginBaristaJWT = (payload) =>
  api.post("barista/login-with-code/", payload, { __noAuth: true });

export const loginBaristaOld = (payload) =>
  api.post("barista/token/", payload, { __noAuth: true });

export const getMe = () => api.get("me/");

// Автоматическая аутентификация через Telegram (рекомендую добавить на backend)
export const telegramAuth = () => {
  const initData = localStorage.getItem("tg_init_data");
  if (!initData) return Promise.reject("No Telegram initData");
  return api.post("auth/telegram/", { init_data: initData }, { __noAuth: true });
};

// ==========================
// ===       ПРОФИЛЬ      ===
// ==========================

export const getUserProfile = () => api.get("user/profile/");
export const updateUserProfile = (payload) => api.patch("user/profile/", payload);

// ==========================
// ===     ЛОЯЛЬНОСТЬ     ===
// ==========================

export const getLoyaltyStatus = (username) =>
  api.get("loyalty/status/", { params: { username } });

export const addStampToUser = (payload) =>
  api.post("loyalty/add-stamp/", payload);

export const generateLoyaltyCode = () =>
  api.post("loyalty/generate-code/");

export const redeemLoyaltyCode = ({ code }) =>
  api.post("loyalty/redeem-code/", { code });

export const checkLoyaltyCode = ({ code }) =>
  api.post("loyalty/check-code/", { code });

export const resetLoyalty = () => api.post("loyalty/reset/");

// ==========================
// ===     РЕГИСТРАЦИЯ    ===
// ==========================

export const registerUser = (payload) =>
  api.post("register/", payload, { __noAuth: true });

export const registerBarista = (payload) =>
  api.post("barista/register/", payload, { __noAuth: true });

export const baristaVerifyCode = (payload) =>
  api.post("barista/verify-code/", payload, { __noAuth: true });

// ==========================
// ===     СМЕНА ПАРОЛЯ   ===
// ==========================

export const changePassword = (payload) =>
  api.post("change_password/", payload);

// ==========================
// ===       ВЫХОД        ===
// ==========================

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("tg_init_data"); // Очищаем Telegram данные
  localStorage.removeItem("user_type");
  localStorage.removeItem("view_mode");

  // Редирект на логин, если не там
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// Главный экспорт
export default api;
