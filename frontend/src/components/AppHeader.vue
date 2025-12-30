<template>
  <!-- Навигационное меню — скрывается на страницах авторизации -->
  <nav v-if="showNav" class="navbar">
    <div class="nav-container">
      <router-link to="/" class="logo">
        <h1>6Кофе</h1>
        <span class="logo-subtitle">Система лояльности</span>
      </router-link>

      <div class="nav-links">
        <template v-if="isAuthenticated && userLoaded">
          <!-- Режим "Клиент" -->
          <template v-if="currentViewRole === 'customer'">
            <router-link
              to="/loyalty"
              class="nav-link nav-btn"
              active-class="active"
              @click="handleNavClick"
            >
              Лояльность
            </router-link>

            <router-link
              to="/profile"
              class="nav-link"
              active-class="active"
              @click="handleNavClick"
            >
              Профиль
            </router-link>
          </template>

          <!-- Режим "Бариста" -->
          <template v-else-if="currentViewRole === 'barista'">
            <router-link
              to="/barista"
              class="nav-link nav-btn"
              active-class="active"
              @click="handleNavClick"
            >
              Панель баристы
            </router-link>

            <router-link
              to="/register-barista"
              class="nav-link nav-btn"
              @click="handleNavClick"
            >
              + Бариста
            </router-link>
          </template>

          <!-- Переключатель режима — только если пользователь реально бариста -->
          <button
            v-if="isRealBarista"
            @click="toggleViewMode"
            class="mode-toggle-btn"
          >
            Режим: <strong>{{ viewMode === "customer" ? "Клиент" : "Бариста" }}</strong>
            <span class="switch-icon">↔</span>
          </button>

          <!-- Приветствие -->
          <span class="user-greeting">
            Привет, {{ username }}!
            <em v-if="isRealBarista" class="role-hint">
              ({{ viewMode === "customer" ? "режим клиента" : "режим баристы" }})
            </em>
          </span>

          <button @click="handleLogout" class="logout-btn">Выйти</button>
        </template>

        <!-- Не авторизован -->
        <template v-else>
          <i class="icon-info"></i>
          <span>Не появились нужные вкладки? — обновите страницу ↻</span>
          <button @click="hideHint" class="hint-close">×</button>
        </template>
      </div>
    </div>

    
      
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getMe, logout } from "@/api";

const router = useRouter();
const route = useRoute();

const username = ref("");
const userLoaded = ref(false);
const realRole = ref("customer");
const viewMode = ref(localStorage.getItem("view_mode") || "customer");

// Заменяем computed на ref для isAuthenticated
const isAuthenticated = ref(!!localStorage.getItem("access"));

const isRealBarista = computed(() => realRole.value === "barista");
const currentViewRole = computed(() => {
  return isRealBarista.value ? viewMode.value : "customer";
});

const showNav = computed(() => {
  const hideOn = ["/login", "/register", "/register-barista"];
  return !hideOn.includes(route.path);
});

// === ПОДСКАЗКА ===
const showRefreshHint = ref(false);
const hasSeenHint = ref(false);

watch(isAuthenticated, (newVal) => {
  if (newVal && !hasSeenHint.value) {
    setTimeout(() => {
      if (isAuthenticated.value) showRefreshHint.value = true;
    }, 3000);
  }
});

function hideHint() {
  showRefreshHint.value = false;
  hasSeenHint.value = true;
}

// Переключение режима
function toggleViewMode() {
  viewMode.value = viewMode.value === "customer" ? "barista" : "customer";
  localStorage.setItem("view_mode", viewMode.value);

  router.push(viewMode.value === "barista" ? "/barista" : "/loyalty");
}

// Загрузка данных пользователя
async function loadCurrentUser() {
  const token = localStorage.getItem("access");
  if (!token) {
    username.value = "";
    userLoaded.value = false;
    realRole.value = "customer";
    viewMode.value = "customer";
    localStorage.removeItem("view_mode");
    localStorage.removeItem("user_type");
    localStorage.removeItem("username");
    isAuthenticated.value = false; // Обновляем ref вручную
    return;
  }

  try {
    userLoaded.value = false;
    const res = await getMe();
    const data = res.data;

    username.value = data.username || "Пользователь";
    localStorage.setItem("username", username.value);

    realRole.value = data.is_barista || data.is_staff ? "barista" : "customer";
    localStorage.setItem("user_type", realRole.value);

    if (realRole.value === "customer") {
      viewMode.value = "customer";
      localStorage.setItem("view_mode", "customer");
    }
  } catch (err) {
    console.warn("Ошибка загрузки профиля:", err);
    if (err.response?.status === 401) handleLogout();
  } finally {
    userLoaded.value = true;
    isAuthenticated.value = !!localStorage.getItem("access"); // Обновляем ref вручную в finally
  }
}

// ✅ Следим за изменениями аутентификации
watch(isAuthenticated, async (newVal) => {
  if (newVal) {
    await loadCurrentUser();
  } else {
    username.value = "";
    userLoaded.value = false;
    realRole.value = "customer";
    viewMode.value = "customer";
    localStorage.removeItem("username");
    localStorage.removeItem("user_type");
    localStorage.removeItem("view_mode");
  }
}, { immediate: true });

function handleNavClick() {
  if (isAuthenticated.value && !userLoaded.value) loadCurrentUser();
}

function handleLogout() {
  logout();
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  
  username.value = "";
  userLoaded.value = false;
  realRole.value = "customer";
  viewMode.value = "customer";
  localStorage.removeItem("username");
  localStorage.removeItem("user_type");
  localStorage.removeItem("view_mode");

  isAuthenticated.value = false; // Обновляем ref вручную после удаления токенов

  // ✅ Отправляем событие для обновления других компонентов
  window.dispatchEvent(new CustomEvent("auth-changed"));
  
  router.push("/login");
}

onMounted(() => {
  // Загружаем данные при монтировании
  loadCurrentUser();
  
  // ✅ Слушаем глобальные события об изменении аутентификации
  window.addEventListener("auth-changed", () => {
    isAuthenticated.value = !!localStorage.getItem("access"); // Обновляем ref вручную в listener
    loadCurrentUser();
  });
  
  // ✅ Слушаем изменения в localStorage из других вкладок
  window.addEventListener("storage", (event) => {
    if (event.key === "access") {
      isAuthenticated.value = !!localStorage.getItem("access"); // Обновляем ref вручную в listener
      loadCurrentUser();
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("auth-changed", () => {});
  window.removeEventListener("storage", () => {});
});
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.25);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

/* ПОДСКАЗКА ПОД ХЕДЕРОМ */
.refresh-hint-header {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  color: #4b5563;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 999;
  animation: slideDown 0.4s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.2);
  margin-top: 8px;
}

.hint-close {
  margin-left: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hint-close:hover {
  color: #ef4444;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.logo {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.logo-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 400;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  cursor: pointer;
  display: block;
  pointer-events: auto;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.25);
  font-weight: 700;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
}

.nav-btn:hover,
.nav-btn.active {
  background: white;
  color: #6366f1;
}

.mode-toggle-btn {
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.switch-icon {
  font-size: 1.2rem;
  opacity: 0.9;
}

.role-hint {
  font-size: 0.85rem;
  opacity: 0.8;
  font-style: italic;
  margin-left: 0.5rem;
}

.user-greeting {
  margin-right: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  white-space: nowrap;
}

.logout-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #fca5a5;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #ef4444;
  border-color: #ef4444;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .nav-links {
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .logo h1 {
    font-size: 1.6rem;
  }

  .user-greeting {
    margin: 0 0 0.5rem 0;
    display: block;
  }

  .mode-toggle-btn {
    width: 100%;
    justify-content: center;
  }

  .role-hint {
    display: block;
    margin-left: 0;
    margin-top: 4px;
  }

  .refresh-hint-header {
    left: 20px;
    right: 20px;
    transform: none;
    width: auto;
  }
}

.icon-info::before {
  content: "ℹ️";
}
</style>