<!-- BaristaPanel.vue — финальная простая версия с кнопкой обновления -->
<template>
  <div class="barista-panel">
    <!-- Сайдбар -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <i class="icon-coffee"></i>
          <span>Coffee Shop</span>
        </div>
        <div class="user-info">
          <div class="user-avatar">
            {{ me?.username?.charAt(0)?.toUpperCase() || 'B' }}
          </div>
          <div class="user-details">
            <div class="user-name">{{ me?.username || 'Бариста' }}</div>
            <div class="user-role">Бариста</div>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="sidebar-stats">
        <div class="stat-item">
          <i class="icon-qr"></i>
          <div class="stat-info">
            <div class="stat-value">{{ stats.codesActivated }}</div>
            <div class="stat-label">Активировано кодов</div>
          </div>
        </div>

        <div class="stat-item">
          <i class="icon-stamp"></i>
          <div class="stat-info">
            <div class="stat-value">{{ stats.stampsToday }}</div>
            <div class="stat-label">Штампов сегодня</div>
          </div>
        </div>

        <div class="stat-item">
          <i class="icon-calendar"></i>
          <div class="stat-info">
            <div class="stat-value">{{ stats.stampsWeek }}</div>
            <div class="stat-label">Штампов за неделю</div>
          </div>
        </div>
      </div>

      <!-- Кнопка обновления + подсказка -->
      <div class="sidebar-refresh">
        <button class="btn-refresh" @click="refreshPage" title="Обновить статистику">
          <i class="icon-refresh"></i>
        </button>
        <p class="refresh-hint">
          Хочешь увидеть свою статистику?<br>
          Обнови страничку
        </p>
      </div>

      <!-- Выход -->
      <div class="sidebar-footer">
        <button class="btn-logout" @click="logout">
          <i class="icon-logout"></i>
          Выйти
        </button>
      </div>
    </aside>

    <!-- Основной контент -->
    <main class="main-content">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-text">Загружаем панель...</div>
      </div>

      <template v-else>
        <div v-if="error" class="alert alert-error">
          <i class="icon-error"></i>
          <span>{{ error }}</span>
        </div>

        <div class="welcome-card glass-card">
          <div class="welcome-content">
            <h2>Добро пожаловать в панель баристы!</h2>
            <p>Используйте эту панель для управления лояльностью клиентов и активации кодов.</p>
          </div>
          <div class="welcome-illustration">
            <i class="icon-barista-large"></i>
          </div>
        </div>

        <div class="content-tabs">
          <button 
            :class="['tab-btn', { active: tab === 'reward' }]" 
            @click="tab = 'reward'"
          >
            <i class="icon-qr"></i>
            Проверка кода
          </button>
          <button 
            :class="['tab-btn', { active: tab === 'stamps' }]" 
            @click="tab = 'stamps'"
          >
            <i class="icon-stamp"></i>
            Начисление штампов
          </button>
        </div>

        <div class="tab-content">
          <div v-if="tab === 'reward'" class="tab-pane">
            <VerifyAndReward />
          </div>
          <div v-else-if="tab === 'stamps'" class="tab-pane">
            <AddStamp />
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";
import { getMe } from "@/api";
import VerifyAndReward from "@/components/barista/VerifyAndReward.vue";
import AddStamp from "@/components/barista/AddStamp.vue";

const tab = ref("reward");
const loading = ref(true);
const error = ref("");
const me = ref(null);
const stats = ref({
  codesActivated: 0,
  stampsToday: 0,
  stampsWeek: 0
});
const router = useRouter();

const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("barista_session");
  localStorage.removeItem("view_mode");
  router.push("/login");
};

// Полное обновление страницы
function refreshPage() {
  window.location.reload();
}

onMounted(async () => {
  const token = localStorage.getItem("access");
  if (!token) {
    router.push({ name: "login", query: { next: "/barista" } });
    return;
  }

  try {
    const meRes = await getMe();
    me.value = meRes.data;

    if (!(me.value?.is_staff || me.value?.is_barista)) {
      error.value = "Доступ только для сотрудников.";
      setTimeout(() => router.push("/"), 1200);
      return;
    }

    // Загружаем статистику один раз при входе
    const statsRes = await api.get("barista/stats/");
    stats.value = {
      codesActivated: statsRes.data.codes_activated || 0,
      stampsToday: statsRes.data.stamps_today || 0,
      stampsWeek: statsRes.data.stamps_week || 0
    };

  } catch (e) {
    console.error("Ошибка загрузки панели:", e);
    error.value = "Не удалось загрузить данные. Войдите заново.";
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setTimeout(() => router.push("/login"), 800);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.barista-panel {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Сайдбар */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-header {
  padding: 32px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 32px;
}

.logo i {
  font-size: 28px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-role {
  font-size: 14px;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
}

/* Статистика */
.sidebar-stats {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.stat-item i {
  font-size: 28px;
  opacity: 0.9;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}

/* Кнопка обновления + подсказка */
.sidebar-refresh {
  padding: 24px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-refresh {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto 16px;
}

.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(360deg);
}

.refresh-hint {
  font-size: 13px;
  opacity: 0.8;
  line-height: 1.4;
  margin: 0;
}

/* Выход */
.sidebar-footer {
  padding: 24px;
  margin-top: auto;
}

.btn-logout {
  width: 100%;
  padding: 14px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Основной контент */
.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: var(--bg-secondary);
}

.welcome-card {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
}

.welcome-content h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px;
}

.welcome-content p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  max-width: 600px;
}

.welcome-illustration i {
  font-size: 120px;
  opacity: 0.8;
}

.content-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  padding: 4px;
  background: var(--surface-secondary);
  border-radius: 16px;
  max-width: 400px;
}

.tab-btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab-btn.active {
  background: white;
  color: var(--primary-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Иконки */
.icon-coffee::before { content: "☕"; }
.icon-qr::before { content: "📱"; }
.icon-stamp::before { content: "🖋️"; }
.icon-calendar::before { content: "📅"; }
.icon-logout::before { content: "🚪"; }
.icon-barista-large::before { content: "👨‍🍳"; }
.icon-error::before { content: "❌"; }
.icon-refresh::before { content: "↻"; }

/* Переменные */
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --card-bg: rgba(255, 255, 255, 0.95);
  --surface-secondary: rgba(249, 250, 251, 0.8);
  --border-color: rgba(229, 231, 235, 0.8);
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --primary-color: #6366f1;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --card-bg: rgba(30, 41, 59, 0.95);
    --surface-secondary: rgba(51, 65, 85, 0.8);
    --border-color: rgba(71, 85, 105, 0.8);
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
  }
}

@media (max-width: 1024px) {
  .barista-panel { flex-direction: column; }
  .sidebar { width: 100%; height: auto; position: static; }
}

@media (max-width: 768px) {
  .main-content { padding: 20px; }
  .welcome-card { flex-direction: column; text-align: center; gap: 24px; }
  .welcome-illustration i { font-size: 80px; }
}
</style>