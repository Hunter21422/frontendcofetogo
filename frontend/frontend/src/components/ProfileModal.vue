<!-- src/components/ProfileModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content glass-card">
      <button class="modal-close" @click="$emit('close')">
        <i class="icon-close"></i>
      </button>

      <!-- Если уже залогинен -->
      <div v-if="auth.user" class="profile-section">
        <div class="profile-header">
          <div class="avatar">
            {{ auth.user.username.charAt(0).toUpperCase() }}
          </div>
          <div class="profile-info">
            <h3 class="profile-name">{{ auth.user.username }}</h3>
            <p class="profile-role">
              <span :class="['role-badge', auth.user.is_staff || auth.user.is_barista ? 'badge-barista' : 'badge-user']">
                <i :class="auth.user.is_staff || auth.user.is_barista ? 'icon-barista' : 'icon-user'"></i>
                {{ auth.user.is_staff || auth.user.is_barista ? 'Бариста' : 'Пользователь' }}
              </span>
            </p>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-item">
            <i class="icon-stamp"></i>
            <div>
              <span class="stat-value">12</span>
              <span class="stat-label">Штампов</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="icon-cup"></i>
            <div>
              <span class="stat-value">3</span>
              <span class="stat-label">Напитков</span>
            </div>
          </div>
        </div>

        <!-- Если бариста -->
        <router-link
          v-if="auth.user.is_staff || auth.user.is_barista || localStorage.getItem('barista_session')==='true'"
          to="/barista"
          class="btn-primary btn-full"
          @click="$emit('close')"
        >
          <i class="icon-dashboard"></i>
          Панель баристы
        </router-link>

        <button class="btn-logout" @click="logout">
          <i class="icon-logout"></i>
          Выйти
        </button>
      </div>

      <!-- Если НЕ залогинен -->
      <div v-else class="auth-section">
        <div class="tabs">
          <button 
            :class="['tab', { active: tab==='login' }]" 
            @click="tab='login'"
          >
            <i class="icon-login"></i>
            Вход
          </button>
          <button 
            :class="['tab', { active: tab==='register' }]" 
            @click="tab='register'"
          >
            <i class="icon-register"></i>
            Регистрация
          </button>
          <button 
            :class="['tab', { active: tab==='barista' }]" 
            @click="tab='barista'"
          >
            <i class="icon-barista"></i>
            Бариста
          </button>
        </div>

        <div class="tab-content">
          <!-- Вход -->
          <div v-if="tab==='login'" class="tab-pane">
            <h4>Войти в аккаунт</h4>
            <div class="form-group">
              <input 
                v-model="username" 
                placeholder="Логин" 
                class="form-input"
              />
            </div>
            <div class="form-group">
              <input 
                v-model="password" 
                type="password" 
                placeholder="Пароль" 
                class="form-input"
              />
            </div>
            <button @click="login" class="btn-primary btn-full">
              <i class="icon-login"></i>
              Войти
            </button>
          </div>

          <!-- Регистрация -->
          <div v-if="tab==='register'" class="tab-pane">
            <h4>Создать аккаунт</h4>
            <div class="form-group">
              <input 
                v-model="username" 
                placeholder="Логин" 
                class="form-input"
              />
            </div>
            <div class="form-group">
              <input 
                v-model="password" 
                type="password" 
                placeholder="Пароль" 
                class="form-input"
              />
            </div>
            <button @click="register" class="btn-primary btn-full">
              <i class="icon-register"></i>
              Зарегистрироваться
            </button>
          </div>

          <!-- Бариста -->
          <div v-if="tab==='barista'" class="tab-pane">
            <h4>Вход для баристы</h4>
            <div class="form-group">
              <input 
                v-model="username" 
                placeholder="Логин" 
                class="form-input"
              />
            </div>
            <div class="form-group">
              <input 
                v-model="password" 
                type="password" 
                placeholder="Пароль" 
                class="form-input"
              />
            </div>
            <div class="form-group">
              <input 
                v-model="employee_code" 
                placeholder="Код сотрудника" 
                class="form-input"
              />
            </div>
            <button @click="loginBarista" class="btn-primary btn-full">
              <i class="icon-barista"></i>
              Войти как бариста
            </button>
          </div>
        </div>

        <p v-if="error" class="error-message">
          <i class="icon-error"></i>
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginJWT, registerUser, getMe } from "@/api";
import { useAuth } from "@/composables/useAuth";

const auth = useAuth();
const router = useRouter();

const tab = ref("login");
const username = ref("");
const password = ref("");
const employee_code = ref("");
const error = ref("");

async function login() {
  try {
    const { data } = await loginJWT({ username: username.value, password: password.value });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    const me = await getMe();
    auth.setUser(me.data);
    window.location.reload();
  } catch (e) {
    error.value = "Ошибка входа";
  }
}

async function register() {
  try {
    await registerUser({ username: username.value, password: password.value });
    tab.value = "login";
  } catch (e) {
    error.value = "Ошибка регистрации";
  }
}

async function loginBarista() {
  try {
    const { data } = await loginJWT({ username: username.value, password: password.value });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    const me = await getMe();
    auth.setUser(me.data);

    if (employee_code.value === "1234") {
      localStorage.setItem("barista_session", "true");
      router.push("/barista");
    } else {
      error.value = "Неверный код сотрудника";
    }
  } catch (e) {
    error.value = "Ошибка входа бариста";
  }
}

function logout() {
  auth.logout();
  localStorage.removeItem("barista_session");
  window.location.replace("/");
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 32px;
  min-width: 400px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
  border: 1px solid var(--border-color);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--surface-secondary);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

/* Профиль */
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.profile-role {
  margin: 0;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.badge-barista {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.badge-user {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 24px 0;
  padding: 20px;
  background: var(--surface-secondary);
  border-radius: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item i {
  font-size: 24px;
  color: var(--primary-color);
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
}

.btn-primary {
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.btn-full {
  width: 100%;
  margin-bottom: 12px;
}

.btn-logout {
  width: 100%;
  padding: 16px 24px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-logout:hover {
  background: var(--surface-secondary);
  color: var(--text-primary);
}

/* Табы */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: var(--surface-secondary);
  padding: 4px;
  border-radius: 12px;
}

.tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.tab.active {
  background: white;
  color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-content {
  margin-bottom: 20px;
}

.tab-pane h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.error-message {
  padding: 12px 16px;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1px solid #ef4444;
  border-radius: 12px;
  color: #991b1b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Иконки */
.icon-close::before { content: "✕"; }
.icon-stamp::before { content: "🖋️"; }
.icon-cup::before { content: "☕"; }
.icon-dashboard::before { content: "📊"; }
.icon-logout::before { content: "🚪"; }
.icon-login::before { content: "🔑"; }
.icon-register::before { content: "📝"; }
.icon-barista::before { content: "🎩"; }
.icon-error::before { content: "❌"; }

/* CSS переменные */
:root {
  --card-bg: rgba(255, 255, 255, 0.98);
  --surface-secondary: rgba(249, 250, 251, 0.8);
  --input-bg: rgba(255, 255, 255, 0.9);
  --border-color: rgba(229, 231, 235, 0.8);
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --primary-color: #6366f1;
  --primary-rgb: 99, 102, 241;
}

@media (prefers-color-scheme: dark) {
  :root {
    --card-bg: rgba(17, 24, 39, 0.98);
    --surface-secondary: rgba(51, 65, 85, 0.8);
    --input-bg: rgba(30, 41, 59, 0.9);
    --border-color: rgba(71, 85, 105, 0.8);
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
  }
  
  .tab.active {
    background: rgba(30, 41, 59, 0.9);
  }
}

/* Адаптивность */
@media (max-width: 480px) {
  .modal-content {
    min-width: unset;
    width: 95%;
    padding: 24px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .tabs {
    flex-direction: column;
  }
}
</style>