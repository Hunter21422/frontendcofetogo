<!-- RegisterModal.vue - улучшенный дизайн -->
<template>
  <transition name="modal">
    <div class="modal-overlay" @click.self="$emit('close')">
      <!-- Анимированный фон -->
      <div class="background-animation">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
        <div class="sparkles">
          <span v-for="n in 12" :key="n" :class="`sparkle-${n}`"></span>
        </div>
      </div>
      
      <div class="modal-container">
        <!-- Закрытие -->
        <button class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-xmark"></i>
        </button>
        
        <!-- Прогресс регистрации -->
        <div class="progress-section">
          <div class="progress-steps">
            <div class="step active">
              <div class="step-circle">
                <i class="fa-solid fa-user-plus"></i>
              </div>
              <span class="step-label">Аккаунт</span>
            </div>
            <div class="step-line"></div>
            <div class="step">
              <div class="step-circle">
                <i class="fa-solid fa-user-check"></i>
              </div>
              <span class="step-label">Профиль</span>
            </div>
            <div class="step-line"></div>
            <div class="step">
              <div class="step-circle">
                <i class="fa-solid fa-mug-hot"></i>
              </div>
              <span class="step-label">Бонус</span>
            </div>
          </div>
          <div class="progress-text">Шаг 1 из 3</div>
        </div>

        <!-- Заголовок -->
        <div class="modal-header">
          <h2 class="modal-title">
            <i class="fa-solid fa-user-plus"></i>
            Станьте частью нашего сообщества
          </h2>
          <p class="modal-subtitle">Зарегистрируйтесь и получите первый штамп в подарок!</p>
        </div>

        <!-- Форма регистрации -->
        <form @submit.prevent="submit" class="register-form">
          <!-- Имя пользователя -->
          <div class="input-group">
            <label class="input-label">
              <i class="fa-solid fa-user"></i>
              <span>Имя пользователя</span>
            </label>
            <div class="input-wrapper">
              <input
                v-model.trim="form.username"
                type="text"
                placeholder="Придумайте уникальный логин"
                autocomplete="username"
                class="form-input"
                required
                @input="validateUsername"
              />
              <div class="input-border"></div>
              <div class="input-status" v-if="form.username">
                <i :class="usernameValid ? 'fa-solid fa-check success' : 'fa-solid fa-xmark error'"></i>
              </div>
            </div>
            <div class="input-hint" v-if="form.username">
              <span :class="usernameValid ? 'success' : 'error'">
                {{ usernameHint }}
              </span>
            </div>
          </div>

          <!-- Пароль -->
          <div class="input-group">
            <label class="input-label">
              <i class="fa-solid fa-lock"></i>
              <span>Пароль</span>
            </label>
            <div class="input-wrapper">
              <input
                :type="showPass ? 'text' : 'password'"
                v-model="form.password"
                placeholder="Создайте надежный пароль"
                autocomplete="new-password"
                class="form-input"
                required
                @input="validatePassword"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPass = !showPass"
                :aria-label="showPass ? 'Скрыть пароль' : 'Показать пароль'"
              >
                <i :class="showPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
              <div class="input-border"></div>
            </div>
            
            <!-- Индикатор сложности пароля -->
            <div class="password-strength">
              <div class="strength-label">Сложность пароля:</div>
              <div class="strength-meter">
                <div 
                  class="strength-fill" 
                  :style="{ width: passwordStrength + '%' }"
                  :class="passwordStrengthClass"
                ></div>
              </div>
              <div class="strength-text">{{ passwordStrengthText }}</div>
            </div>
            
            <!-- Требования к паролю -->
            <div class="password-requirements">
              <div class="requirement" :class="{ met: /.{8,}/.test(form.password) }">
                <i :class="getRequirementIcon(/.{8,}/.test(form.password))"></i>
                <span>Не менее 8 символов</span>
              </div>
              <div class="requirement" :class="{ met: /[A-Z]/.test(form.password) }">
                <i :class="getRequirementIcon(/[A-Z]/.test(form.password))"></i>
                <span>Хотя бы одна заглавная буква</span>
              </div>
              <div class="requirement" :class="{ met: /[0-9]/.test(form.password) }">
                <i :class="getRequirementIcon(/[0-9]/.test(form.password))"></i>
                <span>Хотя бы одна цифра</span>
              </div>
              <div class="requirement" :class="{ met: /[^A-Za-z0-9]/.test(form.password) }">
                <i :class="getRequirementIcon(/[^A-Za-z0-9]/.test(form.password))"></i>
                <span>Хотя бы один специальный символ</span>
              </div>
            </div>
          </div>

          <!-- Чекбокс бариста -->
          <div class="role-section">
            <div class="role-label">Выберите роль:</div>
            <div class="role-options">
              <div 
                :class="['role-option', { active: !form.isBarista }]"
                @click="form.isBarista = false"
              >
                <div class="role-icon">
                  <i class="fa-solid fa-user"></i>
                </div>
                <div class="role-info">
                  <h4>Обычный пользователь</h4>
                  <p>Доступ к карте лояльности и бонусам</p>
                </div>
                <div class="role-check">
                  <i class="fa-solid fa-check" v-if="!form.isBarista"></i>
                </div>
              </div>
              
              <div 
                :class="['role-option', { active: form.isBarista }]"
                @click="form.isBarista = true"
              >
                <div class="role-icon">
                  <i class="fa-solid fa-user-tie"></i>
                </div>
                <div class="role-info">
                  <h4>Бариста</h4>
                  <p>Доступ к панели управления</p>
                </div>
                <div class="role-check">
                  <i class="fa-solid fa-check" v-if="form.isBarista"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Код сотрудника (только для баристы) -->
          <transition name="slide-down">
            <div v-if="form.isBarista" class="barista-section">
              <div class="section-header">
                <i class="fa-solid fa-id-card"></i>
                <h3>Информация о сотруднике</h3>
              </div>
              
              <div class="input-group">
                <label class="input-label">
                  <i class="fa-solid fa-key"></i>
                  <span>Код сотрудника</span>
                </label>
                <div class="input-wrapper">
                  <input
                    v-model.trim="form.employee_code"
                    type="text"
                    placeholder="Введите уникальный код сотрудника"
                    autocomplete="one-time-code"
                    class="form-input"
                    required
                  />
                  <div class="input-border"></div>
                  <button type="button" class="info-btn" title="Что такое код сотрудника?">
                    <i class="fa-solid fa-question-circle"></i>
                  </button>
                </div>
                <div class="input-hint info">
                  <i class="fa-solid fa-info-circle"></i>
                  <span>Код выдается администратором при оформлении на работу</span>
                </div>
              </div>
              
              <div class="barista-benefits">
                <div class="benefit">
                  <i class="fa-solid fa-chart-line"></i>
                  <span>Статистика продаж</span>
                </div>
                <div class="benefit">
                  <i class="fa-solid fa-users"></i>
                  <span>Управление клиентами</span>
                </div>
                <div class="benefit">
                  <i class="fa-solid fa-qrcode"></i>
                  <span>Активация бонусов</span>
                </div>
              </div>
            </div>
          </transition>

          <!-- Соглашения -->
          <div class="agreements-section">
            <div class="agreement" @click="termsAccepted = !termsAccepted">
              <div :class="['agreement-checkbox', { checked: termsAccepted }]">
                <i class="fa-solid fa-check" v-if="termsAccepted"></i>
              </div>
              <div class="agreement-text">
                Я согласен с <a href="#" class="link">Условиями использования</a>
              </div>
            </div>
            
            <div class="agreement" @click="privacyAccepted = !privacyAccepted">
              <div :class="['agreement-checkbox', { checked: privacyAccepted }]">
                <i class="fa-solid fa-check" v-if="privacyAccepted"></i>
              </div>
              <div class="agreement-text">
                Я согласен с <a href="#" class="link">Политикой конфиденциальности</a>
              </div>
            </div>
            
            <div class="agreement" @click="newsletterAccepted = !newsletterAccepted">
              <div :class="['agreement-checkbox', { checked: newsletterAccepted }]">
                <i class="fa-solid fa-check" v-if="newsletterAccepted"></i>
              </div>
              <div class="agreement-text">
                Я хочу получать новости и специальные предложения
              </div>
            </div>
          </div>

          <!-- Ошибка -->
          <transition name="fade">
            <div v-if="error" class="error-alert">
              <i class="fa-solid fa-circle-exclamation"></i>
              <div>
                <p class="error-title">Ошибка регистрации</p>
                <p class="error-text">{{ error }}</p>
              </div>
            </div>
          </transition>

          <!-- Кнопка регистрации -->
          <button 
            type="submit" 
            class="register-btn"
            :disabled="loading || !canSubmit"
          >
            <span class="btn-content">
              <i class="fa-solid fa-user-plus"></i>
              {{ loading ? 'Создаём аккаунт...' : 'Создать аккаунт' }}
            </span>
            <div class="btn-loader" v-if="loading">
              <div class="loader"></div>
            </div>
            <div class="btn-shine"></div>
            <div class="confetti" v-if="!loading">
              <span v-for="n in 8" :key="n" :class="`confetti-${n}`"></span>
            </div>
          </button>
        </form>

        <!-- Альтернативные варианты -->
        <div class="alternative-section">
          <div class="divider">
            <span>Быстрая регистрация</span>
          </div>
          
          <div class="social-login">
            <div class="social-buttons">
              <button type="button" class="social-btn google">
                <i class="fa-brands fa-google"></i>
                <span>Google</span>
              </button>
              <button type="button" class="social-btn apple">
                <i class="fa-brands fa-apple"></i>
                <span>Apple</span>
              </button>
              <button type="button" class="social-btn phone">
                <i class="fa-solid fa-phone"></i>
                <span>Телефон</span>
              </button>
            </div>
          </div>
          
          <div class="login-link">
            Уже есть аккаунт?
            <button class="link-btn" @click="openLogin">
              <i class="fa-solid fa-right-to-bracket"></i>
              <span>Войти</span>
            </button>
          </div>
        </div>

        <!-- Приветственный бонус -->
        <div class="welcome-bonus">
          <div class="bonus-content">
            <div class="bonus-icon">
              <i class="fa-solid fa-gift"></i>
            </div>
            <div class="bonus-info">
              <h4>Подарок за регистрацию!</h4>
              <p>Получите первый штамп сразу после создания аккаунта</p>
            </div>
          </div>
          <div class="bonus-stamp">
            <div class="stamp">
              <span>1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, reactive, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import { registerUser, registerBarista, loginJWT, getMe } from "@/api";

const emit = defineEmits(["close", "registered", "openLogin"]);
const auth = useAuth();

// Данные формы
const form = reactive({
  username: "",
  password: "",
  isBarista: false,
  employee_code: "",
});

// Состояние
const showPass = ref(false);
const loading = ref(false);
const error = ref("");
const termsAccepted = ref(false);
const privacyAccepted = ref(false);
const newsletterAccepted = ref(true);

// Валидация
const usernameValid = computed(() => {
  return form.username.length >= 3 && 
         form.username.length <= 20 && 
         /^[a-zA-Z0-9_]+$/.test(form.username);
});

const usernameHint = computed(() => {
  if (form.username.length === 0) return "";
  if (form.username.length < 3) return "Слишком короткий (мин. 3 символа)";
  if (form.username.length > 20) return "Слишком длинный (макс. 20 символов)";
  if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    return "Только буквы, цифры и подчеркивание";
  }
  return "Отличный логин!";
});

const passwordStrength = computed(() => {
  let strength = 0;
  if (form.password.length >= 8) strength += 25;
  if (/[A-Z]/.test(form.password)) strength += 25;
  if (/[0-9]/.test(form.password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(form.password)) strength += 25;
  return strength;
});

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value <= 25) return 'weak';
  if (passwordStrength.value <= 50) return 'fair';
  if (passwordStrength.value <= 75) return 'good';
  return 'strong';
});

const passwordStrengthText = computed(() => {
  if (form.password.length === 0) return 'Введите пароль';
  if (passwordStrength.value <= 25) return 'Слабый';
  if (passwordStrength.value <= 50) return 'Средний';
  if (passwordStrength.value <= 75) return 'Хороший';
  return 'Отличный';
});

const canSubmit = computed(() => {
  return form.username && 
         form.password && 
         usernameValid.value && 
         termsAccepted.value && 
         privacyAccepted.value &&
         (!form.isBarista || form.employee_code.trim());
});

// Методы
function openLogin() {
  emit("openLogin");
  emit("close");
}

function validateUsername() {
  // Валидация уже в computed свойствах
}

function validatePassword() {
  // Валидация уже в computed свойствах
}

function getRequirementIcon(met) {
  return met ? 'fa-solid fa-check success' : 'fa-solid fa-circle not-met';
}

async function submit() {
  if (!canSubmit.value) return;
  
  error.value = "";
  loading.value = true;
  
  try {
    // Регистрация
    if (form.isBarista) {
      await registerBarista({
        username: form.username.trim(),
        password: form.password,
        employee_code: form.employee_code.trim(),
      });
    } else {
      await registerUser({
        username: form.username.trim(),
        password: form.password,
      });
    }

    // Автоматический вход после регистрации
    const { data } = await loginJWT({
      username: form.username.trim(),
      password: form.password,
    });
    
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    // Загрузка профиля
    try {
      if (auth?.ensureUser) await auth.ensureUser();
      else await getMe();
    } catch (e) {
      console.warn("Не удалось загрузить профиль:", e);
    }

    emit("registered");
    
    // Задержка перед закрытием для показа анимации
    setTimeout(() => {
      emit("close");
    }, 1500);
    
  } catch (e) {
    error.value =
      e?.response?.data?.error ||
      e?.response?.data?.detail ||
      "Не удалось создать пользователя. Попробуйте другой логин.";
  } finally {
    loading.value = false;
  }
}

// Наблюдатель за паролем
watch(() => form.password, (newVal) => {
  if (newVal.length > 0) {
    // Можно добавить дополнительную логику
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
  animation: modalEnter 0.4s ease;
}

.background-animation {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.15;
  animation: float 20s infinite linear;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #10b981, #34d399);
  bottom: 20%;
  right: 15%;
  animation-delay: 7s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  top: 60%;
  left: 20%;
  animation-delay: 14s;
}

.sparkles span {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: sparkle 3s infinite;
}

.sparkle-1 { top: 30%; left: 15%; animation-delay: 0s; }
.sparkle-2 { top: 40%; right: 20%; animation-delay: 0.5s; }
.sparkle-3 { top: 60%; left: 25%; animation-delay: 1s; }
.sparkle-4 { top: 20%; right: 30%; animation-delay: 1.5s; }

.modal-container {
  width: 100%;
  max-width: 520px;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 32px;
  position: relative;
  box-shadow: 
    0 30px 100px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: #4f46e5;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-btn:hover {
  background: #4f46e5;
  color: white;
  transform: rotate(90deg);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
}

/* Прогресс регистрации */
.progress-section {
  margin-bottom: 32px;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 12px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(249, 250, 251, 0.8);
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 20px;
  transition: all 0.4s ease;
}

.step.active .step-circle {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-color: transparent;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.3);
}

.step-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-line {
  flex: 1;
  height: 3px;
  background: rgba(229, 231, 235, 0.5);
  margin: 0 8px;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  color: #4f46e5;
  font-weight: 600;
}

/* Заголовок */
.modal-header {
  text-align: center;
  margin-bottom: 32px;
}

.modal-title {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.modal-title i {
  color: #4f46e5;
}

.modal-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* Форма регистрации */
.register-form {
  margin-bottom: 32px;
}

.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.input-label i {
  color: #4f46e5;
  width: 18px;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 18px 20px 18px 52px;
  font-size: 16px;
  background: rgba(249, 250, 251, 0.8);
  border: 2px solid transparent;
  border-radius: 16px;
  transition: all 0.4s ease;
  color: #1f2937;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  background: white;
  border-color: #4f46e5;
  box-shadow: 0 0 0 5px rgba(79, 70, 229, 0.1);
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  border-radius: 0 0 16px 16px;
  transition: width 0.4s ease;
}

.form-input:focus ~ .input-border {
  width: 100%;
}

.input-status {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

.success {
  color: #10b981;
}

.error {
  color: #ef4444;
}

.input-hint {
  margin-top: 8px;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-hint.success {
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
}

.input-hint.error {
  background: rgba(239, 68, 68, 0.1);
  color: #991b1b;
}

.input-hint.info {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
}

.password-toggle,
.info-btn {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 18px;
  transition: color 0.3s ease;
}

.password-toggle:hover,
.info-btn:hover {
  color: #4f46e5;
}

.info-btn {
  right: 52px;
}

/* Сложность пароля */
.password-strength {
  margin-top: 16px;
}

.strength-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
  font-weight: 500;
}

.strength-meter {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.strength-fill.weak { background: #ef4444; }
.strength-fill.fair { background: #f59e0b; }
.strength-fill.good { background: #3b82f6; }
.strength-fill.strong { background: #10b981; }

.strength-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-align: right;
}

/* Требования к паролю */
.password-requirements {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.requirement.met {
  color: #10b981;
}

.requirement i.success {
  color: #10b981;
}

.requirement i.not-met {
  color: #d1d5db;
  font-size: 8px;
}

/* Выбор роли */
.role-section {
  margin-bottom: 24px;
}

.role-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.role-option {
  padding: 20px;
  background: rgba(249, 250, 251, 0.8);
  border: 2px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
}

.role-option:hover {
  background: white;
  border-color: rgba(79, 70, 229, 0.3);
  transform: translateY(-4px);
}

.role-option.active {
  background: white;
  border-color: #4f46e5;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.15);
}

.role-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  margin-bottom: 12px;
}

.role-option:not(.active) .role-icon {
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
}

.role-info h4 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.role-info p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.role-check {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.role-option.active .role-check {
  opacity: 1;
  transform: scale(1);
}

/* Секция баристы */
.barista-section {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(79, 70, 229, 0.05));
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-header i {
  font-size: 24px;
  color: #7c3aed;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.barista-benefits {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.benefit {
  padding: 12px;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.benefit:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.1);
}

.benefit i {
  font-size: 20px;
  color: #7c3aed;
}

.benefit span {
  font-size: 12px;
  color: #4b5563;
  font-weight: 500;
  line-height: 1.2;
}

/* Соглашения */
.agreements-section {
  margin-bottom: 24px;
}

.agreement {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.agreement-checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.3s ease;
}

.agreement-checkbox.checked {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-color: transparent;
}

.agreement-checkbox i {
  color: white;
  font-size: 12px;
}

.agreement-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.agreement-text .link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
}

.agreement-text .link:hover {
  text-decoration: underline;
}

/* Ошибка */
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  margin-bottom: 24px;
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.error-alert i {
  font-size: 24px;
  color: #ef4444;
  margin-top: 2px;
}

.error-title {
  font-size: 16px;
  font-weight: 700;
  color: #991b1b;
  margin: 0 0 6px 0;
}

.error-text {
  font-size: 14px;
  color: #991b1b;
  margin: 0;
  line-height: 1.5;
}

/* Кнопка регистрации */
.register-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: none;
  border-radius: 18px;
  padding: 22px 32px;
  color: white;
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.4s ease;
  margin-top: 12px;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(79, 70, 229, 0.4);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.btn-loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  z-index: 2;
}

.loader {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.btn-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  transform: rotate(30deg);
  transition: transform 0.8s ease;
  pointer-events: none;
}

.register-btn:hover .btn-shine:not(:disabled) {
  transform: rotate(30deg) translateX(100%);
}

.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.register-btn:hover .confetti {
  opacity: 1;
}

.confetti span {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(45deg, #f59e0b, #10b981, #4f46e5);
  border-radius: 2px;
  animation: confetti 2s infinite;
}

/* Альтернативные варианты */
.alternative-section {
  margin-bottom: 32px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 28px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 2px dashed rgba(229, 231, 235, 0.5);
}

.divider span {
  padding: 0 20px;
  font-size: 13px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
}

.social-login {
  margin-bottom: 24px;
}

.social-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.social-btn {
  flex: 1;
  padding: 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.social-btn.google {
  color: #374151;
}

.social-btn.google:hover {
  border-color: #db4437;
  color: #db4437;
}

.social-btn.apple {
  color: #374151;
}

.social-btn.apple:hover {
  border-color: #000000;
  color: #000000;
}

.social-btn.phone {
  color: #374151;
}

.social-btn.phone:hover {
  border-color: #10b981;
  color: #10b981;
}

.login-link {
  text-align: center;
  font-size: 15px;
  color: #6b7280;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
  background: none;
  border: none;
  color: #4f46e5;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.link-btn:hover {
  color: #7c3aed;
  transform: translateX(4px);
}

/* Приветственный бонус */
.welcome-bonus {
  background: linear-gradient(135deg, #1f2937, #111827);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  margin-top: 24px;
  position: relative;
  overflow: hidden;
}

.welcome-bonus::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  animation: shine 3s infinite;
}

.bonus-content {
  position: relative;
  z-index: 1;
}

.bonus-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 24px;
  margin-bottom: 12px;
}

.bonus-info h4 {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 0 6px 0;
}

.bonus-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.bonus-stamp {
  position: relative;
  z-index: 1;
}

.stamp {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 32px;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
  animation: stampPulse 2s infinite;
}

/* Анимации */
@keyframes modalEnter {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(10px);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-1000px) rotate(720deg);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes stampPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(245, 158, 11, 0.6);
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

.slide-down-enter-active {
  animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-leave-active {
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 500px;
  }
}

.fade-enter-active {
  animation: fade 0.3s ease;
}

.fade-leave-active {
  animation: fade 0.3s ease reverse;
}

@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-enter-active {
  animation: modalEnter 0.4s ease;
}

.modal-leave-active {
  animation: modalEnter 0.4s ease reverse;
}

/* Адаптивность */
@media (max-width: 480px) {
  .modal-container {
    padding: 24px;
  }
  
  .progress-steps {
    flex-direction: column;
    gap: 16px;
  }
  
  .step-line {
    width: 3px;
    height: 40px;
    margin: 0;
  }
  
  .role-options {
    grid-template-columns: 1fr;
  }
  
  .password-requirements {
    grid-template-columns: 1fr;
  }
  
  .barista-benefits {
    grid-template-columns: 1fr;
  }
  
  .social-buttons {
    flex-direction: column;
  }
  
  .modal-title {
    font-size: 24px;
    flex-direction: column;
    gap: 8px;
  }
}
</style>