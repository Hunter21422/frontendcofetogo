<template>
  <div class="auth-container">
    <div class="auth-card glass-card">
      <div class="auth-header">
        <div class="logo">
          <i class="icon-barista"></i>
          <span>Кофе с тобой (система лояльности)</span>
        </div>
        <h1 class="auth-title">Регистрация баристы</h1>
        <p class="auth-subtitle">Создание аккаунта для сотрудников</p>
      </div>

      <form @submit.prevent="submitRegister" class="auth-form">
        <!-- Логин -->
        <div class="form-group">
          <label class="form-label">Логин</label>
          <div class="input-with-icon">
            <i class="icon-user"></i>
            <input
              v-model.trim="username"
              placeholder="Придумайте логин"
              required
              class="form-input"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Пароль -->
        <div class="form-group">
          <label class="form-label">Пароль</label>
          <div class="input-with-icon">
            <i class="icon-lock"></i>
            <input
              v-model="password"
              type="password"
              placeholder="Придумайте надёжный пароль"
              required
              class="form-input"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Мастер-код -->
        <div class="form-group">
          <label class="form-label">Мастер-код сотрудника</label>
          <div class="input-with-icon">
            <i class="icon-key"></i>
            <input
              v-model.trim="employeeCode"
              placeholder="Введите код"
              required
              class="form-input"
              :disabled="loading"
            />
          </div>
          <p class="helper-text">
            <i class="icon-info"></i>
            Код выдаётся администратором кофейни
          </p>
        </div>

        <!-- Кнопка регистрации -->
        <button type="submit" class="btn-primary btn-full" :disabled="loading">
          <i class="icon-register"></i>
          {{ loading ? "Регистрация…" : "Зарегистрироваться как бариста" }}
        </button>

        <!-- Ошибка -->
        <transition name="fade">
          <div v-if="error" class="alert alert-error">
            <i class="icon-error"></i>
            {{ error }}
          </div>
        </transition>

        <!-- Ссылки в футере -->
        <div class="auth-footer">
          <span>Обычный клиент?</span>
          <router-link to="/register" class="auth-link">
            Зарегистрироваться как клиент
          </router-link>
        </div>

        <div class="auth-footer">
          <span>Уже есть аккаунт?</span>
          <router-link to="/login" class="auth-link">
            Войти
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { registerBarista } from "@/api";

const router = useRouter();

const username = ref("");
const password = ref("");
const employeeCode = ref("");
const loading = ref(false);
const error = ref("");

async function submitRegister() {
  error.value = "";
  loading.value = true;

  try {
    const payload = {
      username: username.value.trim(),
      password: password.value,
      employee_code: employeeCode.value.trim(),
    };

    const { data } = await registerBarista(payload);

    // Сохраняем токены
    localStorage.setItem("access", data.access);
    if (data.refresh) {
      localStorage.setItem("refresh", data.refresh);
    }

    // Успешно — сразу в панель баристы
    await router.push("/barista");
  } catch (e) {
    console.error("Ошибка регистрации баристы:", e);
    error.value =
      e.response?.data?.error ||
      e.response?.data?.detail ||
      "Ошибка регистрации. Проверьте мастер-код или логин.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Основной фон с анимацией */
.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.auth-container::before {
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

/* Карточка */
.auth-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Заголовок */
.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 20px;
}

.auth-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.auth-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Форма */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  font-size: 20px;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 16px 16px 16px 52px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  background: white;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Подсказка */
.helper-text {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Кнопка */
.btn-primary {
  padding: 18px 24px;
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
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-full {
  width: 100%;
}

/* Ошибка */
.alert-error {
  padding: 16px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1px solid #ef4444;
  color: #991b1b;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Футер */
.auth-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.auth-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.auth-link:hover {
  color: #4f46e5;
}

/* Анимация появления ошибки */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Иконки */
.icon-barista::before { content: "🎩"; }
.icon-user::before { content: "👤"; }
.icon-lock::before { content: "🔒"; }
.icon-key::before { content: "🔑"; }
.icon-info::before { content: "ℹ️"; }
.icon-register::before { content: "📝"; }
.icon-error::before { content: "❌"; }

/* Темная тема */
@media (prefers-color-scheme: dark) {
  .auth-card {
    background: rgba(17, 24, 39, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .auth-title { color: #f1f5f9; }
  .auth-subtitle { color: #94a3b8; }
  
  .form-input {
    background: rgba(30, 41, 59, 0.9);
    border-color: #475569;
    color: #f1f5f9;
  }
  
  .form-input:focus { background: rgba(30, 41, 59, 1); }
  
  .auth-footer { border-color: #475569; color: #94a3b8; }
}

/* Адаптивность */
@media (max-width: 640px) {
  .auth-card { padding: 32px 24px; }
  .auth-title { font-size: 28px; }
}
</style>