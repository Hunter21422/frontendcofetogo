<template>
  <div class="verify-reward-card">
    <!-- Заголовок -->
    <div class="card-header">
      <div class="header-icon">
        <div class="icon-circle" :class="{ 'icon-circle-animate': animation }">
          <i class="fa-solid fa-qrcode"></i>
        </div>
      </div>
      <div class="header-content">
        <h3 class="card-title">Проверка кода лояльности</h3>
        <p class="card-subtitle">Введите 6-значный код для проверки</p>
      </div>
    </div>

    <!-- Ввод кода — 6 отдельных полей -->
    <div class="card-body">
      <div class="code-input-section">
        <div class="input-label">
          <i class="fa-solid fa-key"></i>
          <span>Код для проверки</span>
        </div>

        <div class="otp-boxes">
          <input
            v-for="index in 6"
            :key="index"
            v-model="digits[index - 1]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="otp-digit"
            :class="{ 
              'filled': digits[index - 1],
              'active': focusedIndex === index 
            }"
            @input="handleInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
            @focus="focusedIndex = index"
            @paste="handlePaste"
            ref="otpInputs"
          />
        </div>

        <div class="code-hint">
          <i class="fa-solid fa-lightbulb"></i>
          <span>Код состоит из 6 цифр. Введите его без пробелов.</span>
        </div>
      </div>

      <!-- Кнопка проверки -->
      <button 
        class="activate-btn"
        :disabled="loading || code.length < 6"
        @click="verify"
        :class="{ 'btn-loading': loading }"
      >
        <span class="btn-content">
          <i :class="loading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-search'"></i>
          {{ loading ? "Проверяем..." : "Проверить код" }}
        </span>
        <div class="btn-shine"></div>
      </button>

      <!-- Результат проверки -->
      <transition name="message-slide">
        <div v-if="message" :class="['result-message', status]">
          <div class="message-icon">
            <i v-if="status === 'success'" class="fa-solid fa-circle-check"></i>
            <i v-else class="fa-solid fa-circle-exclamation"></i>
          </div>
          <div class="message-content">
            <p class="message-text">{{ message }}</p>
          </div>
        </div>
      </transition>

      <!-- Пример кода -->
      <div class="example-section">
        <div class="example-header">
          <i class="fa-solid fa-eye"></i>
          <span>Как выглядит код:</span>
        </div>
        <div class="example-code">
          <span class="example-digit">1</span>
          <span class="example-digit">2</span>
          <span class="example-digit">3</span>
          <span class="example-digit">4</span>
          <span class="example-digit">5</span>
          <span class="example-digit">6</span>
        </div>
        <p class="example-note">Код генерируется в мобильном приложении клиента</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import api from "@/api";

const digits = ref(["", "", "", "", "", ""]);
const focusedIndex = ref(1);
const otpInputs = ref([]);
const message = ref("");
const status = ref("");
const loading = ref(false);
const animation = ref(false);

// Полный код из всех полей
const code = computed(() => digits.value.join(""));

// Обработка ввода цифры
function handleInput(index, event) {
  let value = event.target.value;

  // Разрешаем только цифры
  if (!/^\d?$/.test(value)) {
    digits.value[index - 1] = "";
    return;
  }

  digits.value[index - 1] = value;

  // Автофокус на следующий
  if (value && index < 6) {
    otpInputs.value[index].focus();
  }
}

// Обработка Backspace
function handleKeydown(index, event) {
  if (event.key === "Backspace" && !digits.value[index - 1] && index > 1) {
    otpInputs.value[index - 2].focus();
  }
}

// Paste всего кода
function handlePaste(event) {
  const paste = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
  if (paste) {
    event.preventDefault();
    for (let i = 0; i < 6; i++) {
      digits.value[i] = paste[i] || "";
    }
    const nextFocus = Math.min(paste.length, 6);
    otpInputs.value[nextFocus - 1]?.focus();
  }
}

// Проверка кода
async function verify() {
  if (code.value.length < 6) return;

  loading.value = true;
  animation.value = true;
  message.value = "";
  status.value = "";

  try {
    await api.post("loyalty/check-code/", { code: code.value });

    message.value = "Код действителен!";
    status.value = "success";

    setTimeout(() => {
      digits.value = ["", "", "", "", "", ""];
      otpInputs.value[0]?.focus();
      animation.value = false;
    }, 1500);
  } catch (e) {
    animation.value = false;

    const detail = e?.response?.data?.detail || "";

    if (e.response?.status === 404) {
      message.value = "Такого кода не существует";
    } else if (detail.includes("использован")) {
      message.value = "Код уже был использован";
    } else if (detail.includes("истёк")) {
      message.value = "Срок действия кода истёк";
    } else {
      message.value = "Код недействителен";
    }

    status.value = "error";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.verify-reward-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.verify-reward-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.header-icon {
  position: relative;
}

.icon-circle {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.3);
}

.icon-circle-animate {
  animation: iconPulse 1.5s infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.card-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.code-input-section {
  margin-bottom: 32px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #4f46e5;
  margin-bottom: 16px;
}

/* Новые 6 боксов для цифр */
.otp-boxes {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 20px 0;
}

.otp-digit {
  width: 60px;
  height: 60px;
  background: white;
  border: 3px dashed #e5e7eb;
  border-radius: 16px;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
  transition: all 0.3s ease;
  outline: none;
}

.otp-digit.filled {
  border-style: solid;
  border-color: #4f46e5;
  background: rgba(99, 102, 241, 0.1);
}

.otp-digit.active {
  border-color: #6366f1;
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.2);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
}

.code-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  margin-top: 12px;
  justify-content: center;
}

/* Кнопка и остальное — без изменений */
.activate-btn {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 32px auto;
  padding: 20px 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: block;
}

.activate-btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.3);
}

.activate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.btn-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  transform: rotate(30deg);
  transition: transform 0.6s ease;
}

.activate-btn:hover .btn-shine {
  transform: rotate(30deg) translateX(100%);
}

.result-message {
  padding: 20px;
  border-radius: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin: 24px 0;
  text-align: center;
}

.result-message.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #86efac;
}

.result-message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.message-icon i {
  font-size: 24px;
  margin-top: 2px;
}

.result-message.success .message-icon i { color: #10b981; }
.result-message.error .message-icon i { color: #ef4444; }

.message-text {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  width: 100%;
}

.example-section {
  background: rgba(249, 250, 251, 0.8);
  border-radius: 16px;
  padding: 20px;
  margin-top: 32px;
}

.example-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: #4f46e5;
  font-weight: 600;
}

.example-code {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 12px;
}

.example-digit {
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid #4f46e5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #4f46e5;
  font-size: 18px;
}

.example-note {
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  margin: 0;
}

/* Адаптивность */
@media (max-width: 640px) {
  .verify-reward-card { padding: 24px; }
  .card-header { flex-direction: column; text-align: center; gap: 16px; }
  .otp-boxes { gap: 8px; }
  .otp-digit { width: 50px; height: 50px; font-size: 28px; }
}
</style>
