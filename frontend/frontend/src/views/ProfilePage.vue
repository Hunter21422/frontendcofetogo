<template>
  <div class="profile-container">
    <div class="profile-card glass-card">
      <div class="profile-header">
        <div class="avatar-circle">
          <i class="icon-user-large"></i>
        </div>
        <h1 class="profile-title">Мой профиль</h1>
        <p class="profile-subtitle">Личная информация и лояльность</p>
      </div>

      <div class="profile-body">
        <!-- Информация о пользователе -->
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">
              <i class="icon-user"></i>
              Логин
            </div>
            <div class="info-value">{{ currentUser.username || "Загрузка..." }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="icon-barista"></i>
              Роль
            </div>
            <div class="info-value role-badge" :class="roleBadgeClass">
              {{ displayRoleText }}
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="icon-stamp"></i>
              Штампы лояльности
            </div>
            <div class="info-value stamps-display">
              <span class="stamps-count">{{ currentStamps }}</span>
              <span class="stamps-max">/ {{ maxStamps }}</span>
            </div>
          </div>

          <div class="info-item full-width">
            <div class="progress-bar-profile">
              <div 
                class="progress-fill-profile" 
                :style="{ width: `${loyaltyProgress}%` }"
              ></div>
            </div>
            <div class="progress-text">
              До бесплатного напитка: {{ stampsToFree }} штамп(ов)
            </div>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="actions-section">
          <router-link 
            v-if="currentViewRole === 'customer'" 
            to="/loyalty" 
            class="btn-primary btn-full btn-with-icon"
          >
            <i class="icon-loyalty"></i>
            Карта лояльности
          </router-link>

          <button @click="handleLogout" class="btn-secondary btn-full btn-with-icon">
            <i class="icon-logout"></i>
            Выйти
          </button>
        </div>

        <!-- Подсказка для баристы — только в режиме "Бариста" -->
        <transition name="fade">
          <div v-if="currentViewRole === 'barista'" class="barista-panel-hint">
            <i class="icon-barista"></i>
            <span>
              Доступна панель баристы
              <router-link to="/barista" class="auth-link">
                Перейти →
              </router-link>
            </span>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { user, ensureUser } from "@/stores/auth";

const router = useRouter();

const maxStamps = 6;

// Данные пользователя из стора
const currentUser = computed(() => user.value || { username: "Загрузка..." });

// Штампы — теперь всегда актуальные
const currentStamps = computed(() => {
  return user.value?.stamps ?? 0;
});

// Реальная роль (бариста или клиент)
const isRealBarista = computed(() => {
  const u = user.value;
  return u ? (u.is_barista === true || u.is_staff === true) : false;
});

// Текущий режим просмотра
const viewMode = computed(() => {
  return localStorage.getItem("view_mode") || "customer";
});

// Виртуальная роль для отображения
const currentViewRole = computed(() => {
  return isRealBarista.value ? viewMode.value : "customer";
});

// Текст и класс роли
const displayRoleText = computed(() => {
  return currentViewRole.value === "barista" ? "Бариста" : "Клиент";
});

const roleBadgeClass = computed(() => ({
  'role-barista': currentViewRole.value === "barista",
  'role-customer': currentViewRole.value === "customer"
}));

// Прогресс
const loyaltyProgress = computed(() => (currentStamps.value / maxStamps) * 100);

const stampsToFree = computed(() => maxStamps - currentStamps.value);

// === АВТООБНОВЛЕНИЕ ДАННЫХ ===
async function refreshProfile() {
  await ensureUser();  // перезагружает user.value с сервера (включая актуальные stamps)
}

// Обновляем при открытии страницы
onMounted(() => {
  refreshProfile();

  // Обновляем при возвращении на вкладку (фокус окна)
  window.addEventListener("focus", refreshProfile);
});

// Убираем слушатель при уходе со страницы
onUnmounted(() => {
  window.removeEventListener("focus", refreshProfile);
});

function handleLogout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("view_mode");
  user.value = null;
  router.push("/login");
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.profile-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
  animation: float 20s infinite linear;
}

@keyframes float {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.profile-card {
  width: 100%;
  max-width: 520px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
}

.icon-user-large {
  font-size: 56px;
  color: white;
}

.profile-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.profile-subtitle {
  font-size: 16px;
  color: #6b7280;
}

.profile-body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.info-grid {
  display: grid;
  gap: 20px;
}

.info-item {
  background: rgba(249, 250, 251, 0.8);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.role-badge {
  align-self: flex-start;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.role-barista {
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
  color: white;
}

.role-customer {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
}

.stamps-display {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stamps-count {
  font-size: 36px;
  color: #6366f1;
}

.stamps-max {
  font-size: 20px;
  color: #9ca3af;
}

.progress-bar-profile {
  height: 16px;
  background: #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin: 12px 0;
}

.progress-fill-profile {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 8px;
  transition: width 0.6s ease;
}

.progress-text {
  text-align: center;
  font-size: 15px;
  color: #4b5563;
  font-weight: 600;
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-primary, .btn-secondary {
  padding: 18px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 2px solid #fca5a5;
}

.btn-secondary:hover {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

.btn-full {
  width: 100%;
}

.barista-panel-hint {
  padding: 20px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 16px;
  text-align: center;
  font-size: 15px;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.barista-panel-hint .auth-link {
  font-weight: 700;
  text-decoration: underline;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.icon-user-large::before { content: "👤"; }
.icon-user::before { content: "👤"; }
.icon-barista::before { content: "🎩"; }
.icon-stamp::before { content: "🖋️"; }
.icon-loyalty::before { content: "🏆"; }
.icon-logout::before { content: "🚪"; }

@media (prefers-color-scheme: dark) {
  .profile-card {
    background: rgba(17, 24, 39, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .profile-title, .info-value, .stamps-count {
    color: #f1f5f9;
  }

  .info-item {
    background: rgba(51, 65, 85, 0.8);
  }

  .progress-bar-profile {
    background: #475569;
  }
}

@media (max-width: 640px) {
  .profile-card { padding: 32px 24px; }
  .profile-title { font-size: 28px; }
  .avatar-circle { width: 100px; height: 100px; }
  .icon-user-large { font-size: 48px; }
}
</style>