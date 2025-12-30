<template>
  <div class="auth-container barista-bg">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <i class="icon-barista-large"></i>
          <div class="logo-text">
            <h1>Панель баристы</h1>
            <p>Вход для сотрудников</p>
          </div>
        </div>
        <p class="auth-subtitle">Только для персонала кофейни</p>
      </div>

      <form @submit.prevent="submitLogin" class="auth-form">
        <!-- Логин -->
        <div class="form-group">
          <label class="form-label">Логин</label>
          <div class="input-wrapper">
            <i class="icon-user"></i>
            <input
              v-model.trim="username"
              placeholder="Введите логин"
              required
              class="form-input"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Пароль -->
        <div class="form-group">
          <label class="form-label">Пароль</label>
          <div class="input-wrapper">
            <i class="icon-lock"></i>
            <input
              v-model="password"
              type="password"
              placeholder="Введите пароль"
              required
              class="form-input"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Кнопка входа -->
        <button type="submit" class="btn-primary" :disabled="loading">
          <i class="icon-login"></i>
          {{ loading ? "Входим…" : "Войти в панель" }}
        </button>

        <!-- Ошибка -->
        <transition name="fade">
          <div v-if="error" class="alert-error">
            <i class="icon-error"></i>
            {{ error }}
          </div>
        </transition>

        <!-- Ссылки внизу -->
        <div class="auth-footer">
          <i class="icon-coffee"></i>
          <span>Вы клиент?</span>
          <router-link to="/login" class="auth-link">
            Обычный вход →
          </router-link>
        </div>

        <div class="auth-footer">
          <span>Нет аккаунта баристы?</span>
          <router-link to="/register-barista" class="auth-link">
            Зарегистрироваться →
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { loginBaristaJWT } from "@/api";

const router = useRouter();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function submitLogin() {
  error.value = "";
  loading.value = true;

  try {
    const res = await loginBaristaJWT({
      username: username.value.trim(),
      password: password.value,
    });

    const data = res.data;

    // Сохраняем токены и тип пользователя
    localStorage.setItem("access", data.access);
    localStorage.setItem("user_type", "barista"); // ← ВАЖНО: отмечаем как бариста
    
    if (data.refresh) {
      localStorage.setItem("refresh", data.refresh);
    }

    // Также можно сохранить в store, если он есть
    if (window.userStore) {
      window.userStore.setUserType('barista');
    }

    // Перебрасываем в панель баристы
    await router.push("/barista");
    
  } catch (e) {
    console.error("Ошибка входа баристы:", e);
    error.value =
      e.response?.data?.error ||
      e.response?.data?.detail ||
      "Неверный логин или пароль";
      
    // Очищаем данные при ошибке
    localStorage.removeItem("user_type");
  } finally {
    loading.value = false;
  }
}

// Очищаем тип пользователя при загрузке страницы входа
// (на случай, если пользователь разлогинился вручную)
onMounted(() => {
  localStorage.removeItem("user_type");
});
</script>

<style scoped>
.auth-container.barista-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #6b46c1 0%, #9f7aea 100%);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 28px;
  padding: 40px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.icon-barista-large {
  font-size: 48px;
}

.logo-text h1 {
  font-size: 28px;
  font-weight: 700;
  color: #553c9a;
  margin: 0;
}

.logo-text p {
  font-size: 16px;
  color: #6b7280;
  margin: 4px 0 0;
}

.auth-subtitle {
  font-size: 16px;
  color: #6b7280;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.input-wrapper i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 20px;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 16px 16px 16px 52px;
  background: #f3f4f6;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  color: #1f2937;
  transition: all 0.3s ease;
  box-sizing: border-box;
  display: block;
}

.form-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
}

.btn-primary {
  padding: 18px;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  color: white;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert-error {
  padding: 16px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 12px;
  color: #991b1b;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 15px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}

.auth-link {
  color: #7c3aed;
  font-weight: 600;
  text-decoration: underline;
}

/* Иконки */
.icon-barista-large::before { content: "🎩"; }
.icon-user::before { content: "👤"; }
.icon-lock::before { content: "🔒"; }
.icon-login::before { content: "🚪"; }
.icon-error::before { content: "❌"; }
.icon-coffee::before { content: "☕"; }

/* Адаптивность */
@media (max-width: 480px) {
  .auth-card { 
    padding: 32px 24px; 
    margin: 0 16px;
  }
  .logo-text h1 { font-size: 24px; }
  .auth-form {
    gap: 20px;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 360px) {
  .auth-card { 
    padding: 24px 20px;
    margin: 0 12px;
  }
  .form-input {
    padding: 14px 14px 14px 48px;
    font-size: 15px;
  }
  .input-wrapper i {
    left: 14px;
    font-size: 18px;
  }
}
</style>