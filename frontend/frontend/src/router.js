// src/router/index.js — исправленная версия с поддержкой переключения режимов

import { createRouter, createWebHistory } from "vue-router";
import { logout } from "@/api"; // функция полной очистки сессии

// Импорты всех страниц
import LoginPage from "@/views/LoginPage.vue";
import RegisterPage from "@/views/RegisterPage.vue";
import RegisterBarista from "@/views/RegisterBarista.vue";
import LoyaltyPage from "@/views/LoyaltyPage.vue";
import ProfilePage from "@/views/ProfilePage.vue";
import BaristaPanel from "@/views/BaristaPanel.vue";

const routes = [
  { path: "/", redirect: "/login" },

  // Публичные маршруты (доступны всем)
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { public: true },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterPage,
    meta: { public: true },
  },
  {
    path: "/register-barista",
    name: "register-barista",
    component: RegisterBarista,
    meta: { public: true },
  },

  // Клиентские маршруты — доступны ВСЕМ авторизованным (и клиентам, и баристам)
  {
    path: "/loyalty",
    name: "loyalty",
    component: LoyaltyPage,
    meta: { requiresAuth: true }, // убрали role: "customer"
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfilePage,
    meta: { requiresAuth: true }, // убрали role: "customer"
  },

  // Маршрут ТОЛЬКО для баристы
  {
    path: "/barista",
    name: "barista",
    component: BaristaPanel,
    meta: { requiresAuth: true, role: "barista" },
  },

  // 404 — редирект на логин
  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Вспомогательные функции
function getCurrentRole() {
  const role = localStorage.getItem("user_type");
  return role === "customer" || role === "barista" ? role : null;
}

function getHomePath(role) {
  if (role === "customer") return "/loyalty";
  if (role === "barista") return "/barista"; // бариста по умолчанию в панель
  return "/login";
}

// Глобальный navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("access");
  const role = getCurrentRole();

  // === 1. Переход на /login ===
  if (to.path === "/login") {
    if (token && role) {
      // Уже залогинен — сразу в свою домашнюю страницу
      return next(getHomePath(role));
    }
    // Не залогинен — чистим и пускаем
    logout();
    return next();
  }

  // === 2. Публичные страницы ===
  if (to.meta.public) {
    return next();
  }

  // === 3. Защищённые маршруты ===
  if (to.meta.requiresAuth) {
    // Нет токена
    if (!token) {
      logout();
      return next("/login");
    }

    // Есть токен, но роль не определена
    if (!role) {
      logout();
      return next("/login");
    }

    // Проверка роли ТОЛЬКО если маршрут её требует
    if (to.meta.role && to.meta.role !== role) {
      console.warn(`Доступ запрещён: пользователь ${role} пытался зайти в зону ${to.meta.role}`);
      // Редирект на домашнюю страницу своей роли
      return next(getHomePath(role));
    }

    // Всё ок — пускаем
    return next();
  }

  // По умолчанию
  next();
});

export default router;