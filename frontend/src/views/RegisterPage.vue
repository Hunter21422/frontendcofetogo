<template>
  <div class="auth-container">
    <div class="auth-card glass-card">
      <div class="auth-header">
        <div class="logo">
          <i class="icon-coffee"></i>
          <span>Кофе с тобой (система лояльности)</span>
        </div>
        <h1 class="auth-title">Создать аккаунт</h1>
        <p class="auth-subtitle">Зарегистрируйтесь как клиент</p>
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
              placeholder="Придумайте пароль"
              required
              class="form-input"
              :disabled="loading"
            />
          </div>
        </div>

        <button type="submit" class="btn-primary btn-full" :disabled="loading">
          {{ loading ? "Регистрация…" : "Зарегистрироваться" }}
        </button>

        <div v-if="error" class="alert alert-error">
          <i class="icon-error"></i>
          {{ error }}
        </div>

        <!-- Ссылка для баристы -->
        <div class="auth-footer barista-link">
          <i class="icon-barista"></i>
          <span>Вы бариста или администратор?</span>
          <router-link to="/register-barista" class="auth-link">
            Тогда вам сюда →
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
import { registerUser } from "@/api";  // обычная регистрация

const router = useRouter();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function submitRegister() {
  error.value = "";
  loading.value = true;

  try {
    await registerUser({
      username: username.value,
      password: password.value,
    });

    // После успешной регистрации клиента — редирект на логин или лояльность
    await router.push("/login");
  } catch (e) {
    error.value =
      e.response?.data?.error ||
      e.response?.data?.detail ||
      "Ошибка регистрации. Возможно, логин занят.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Основной контейнер */
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

/* Фоновый эффект */
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

/* Карточка формы */
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

/* Переключатель пароля */
.password-toggle {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #6366f1;
}

/* Чекбокс */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.checkbox {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox:checked + .checkmark {
  background: #6366f1;
  border-color: #6366f1;
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 14px;
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #374151;
}

/* Подсказка */
.helper-text {
  font-size: 14px;
  color: #6b7280;
  margin: 8px 0 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Специально для ссылки баристы */
.barista-link {
  text-align: center;
  margin: 24px 0;
  padding: 16px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  font-size: 15px;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.barista-link .auth-link {
  font-weight: 700;
  text-decoration: underline;
}

/* Иконки */
.icon-coffee::before { content: "☕"; }
.icon-user::before { content: "👤"; }
.icon-lock::before { content: "🔒"; }
.icon-eye::before { content: "👁️"; }
.icon-eye-off::before { content: "👁️‍🗨️"; }
.icon-barista::before { content: "🎩"; }
.icon-info::before { content: "ℹ️"; }
.icon-error::before { content: "❌"; }
.icon-register::before { content: "📝"; }

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
  
  .checkbox-text { color: #cbd5e1; }
  .auth-footer { border-color: #475569; color: #94a3b8; }
}

/* Адаптивность */
@media (max-width: 640px) {
  .auth-card { padding: 32px 24px; }
  .auth-title { font-size: 28px; }
}
</style>
