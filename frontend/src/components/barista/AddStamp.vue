<template>
  <div class="stamp-card glass-card">
    <div class="card-header">
      <h3 class="card-title">
        <i class="icon-stamp"></i>
        Начислить штамп пользователю
      </h3>
      <div class="card-subtitle">Ручное добавление штампов лояльности</div>
    </div>

    <div class="form-group">
      <div class="input-group">
        <div class="input-with-icon">
          <i class="icon-user"></i>
          <input
            v-model.trim="username"
            placeholder="Имя пользователя (логин)"
            @blur="loadStatus"
            @keyup.enter="loadStatus"
            class="form-input"
            :disabled="loading"
            autocomplete="off"
          />
        </div>

        <div class="input-with-icon">
          <i class="icon-number"></i>
          <input
            v-model.number="amount"
            type="number"
            min="1"
            :max="availableStamps"
            :disabled="loading || stamps === null || atLimit"
            class="form-input number-input"
            placeholder="Кол-во"
          />
        </div>

        <button 
          class="btn-primary btn-lg btn-with-icon"
          :disabled="loading || !canSubmit || atLimit || stamps === null"
          @click="submit"
        >
          <i class="icon-add"></i>
          {{ loading ? "Начисляем…" : "Добавить штамп(ы)" }}
        </button>
      </div>
    </div>

    <!-- Прогресс бар -->
    <div v-if="stamps !== null && maxStamps !== null" class="progress-section">
      <div class="progress-header">
        <span class="progress-label">Прогресс лояльности</span>
        <span class="progress-count">{{ stamps }} / {{ maxStamps }}</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progress}%` }"
          :class="{ 'progress-complete': atLimit }"
        ></div>
      </div>
      <div class="progress-dots">
        <span 
          v-for="n in maxStamps" 
          :key="n"
          :class="['progress-dot', { 'filled': n <= stamps }]"
        >
          {{ n }}
        </span>
      </div>

      <div class="progress-note" v-if="atLimit">
        🎉 Лимит достигнут — положен бесплатный напиток!
      </div>
    </div>

    <!-- Сообщение -->
    <transition name="fade">
      <div v-if="msg" :class="['alert', `alert-${status}`]">
        <i :class="`icon-${status}`"></i>
        <span>{{ msg }}</span>
      </div>
    </transition>

    <div class="hint">
      <i class="icon-info"></i>
      Введите логин пользователя и нажмите Enter или кликните вне поля для проверки статуса.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { getLoyaltyStatus, addStampToUser } from "@/api";

const username = ref("");
const amount = ref(1);
const loading = ref(false);
const msg = ref("");
const status = ref("");
const stamps = ref(null);
const maxStamps = ref(null);

const canSubmit = computed(() => 
  !!username.value.trim() && 
  Number(amount.value) > 0 && 
  stamps !== null && 
  !atLimit.value
);

const atLimit = computed(() => 
  stamps.value !== null && 
  maxStamps.value !== null && 
  stamps.value >= maxStamps.value
);

const availableStamps = computed(() => 
  atLimit.value ? 0 : (maxStamps.value - stamps.value)
);

const progress = computed(() => {
  if (stamps.value === null || maxStamps.value === null) return 0;
  return Math.min(100, (stamps.value / maxStamps.value) * 100);
});

async function loadStatus() {
  const name = username.value.trim();
  if (!name) {
    stamps.value = null;
    maxStamps.value = null;
    msg.value = "";
    status.value = "";
    amount.value = 1;
    return;
  }

  loading.value = true;
  msg.value = "Проверяем статус...";
  status.value = "info";

  try {
    const { data } = await getLoyaltyStatus(name);
    stamps.value = Number(data.stamps ?? 0);
    maxStamps.value = Number(data.max_stamps ?? 6);

    if (atLimit.value) {
      msg.value = "🎉 Пользователь достиг лимита! Положен бесплатный напиток.";
      status.value = "success";
    } else {
      msg.value = `Текущий прогресс: ${stamps.value}/${maxStamps.value}`;
      status.value = "info";
    }
  } catch (e) {
    if (e.response?.status === 404) {
      msg.value = "Пользователь с таким логином не найден";
      status.value = "warning";
    } else {
      msg.value = "Ошибка сервера. Попробуйте позже.";
      status.value = "error";
    }
    stamps.value = null;
    maxStamps.value = null;
  } finally {
    loading.value = false;
  }
}

async function submit() {
  if (!canSubmit.value) return;

  loading.value = true;
  msg.value = "Начисляем штамп(ы)...";
  status.value = "info";

  try {
    const { data } = await addStampToUser({
      username: username.value.trim(),
      amount: Number(amount.value || 1),
    });

    // Обновляем локальные данные — точно знаем, сколько добавлено
    const added = Number(data.stamps_added || amount.value);
    stamps.value = Number(data.stamps_total ?? data.stamps ?? (stamps.value + added));
    maxStamps.value = Number(data.max_stamps ?? maxStamps.value);

    msg.value = `✅ Добавлено ${added} штамп(ов)! Теперь: ${stamps.value}/${maxStamps.value}`;
    status.value = "success";

    if (atLimit.value) {
      msg.value += " 🎉 Лимит достигнут — положен бесплатный напиток!";
    }

    // Сбрасываем количество
    amount.value = 1;
  } catch (e) {
    msg.value = e?.response?.data?.detail || e?.response?.data?.error || "Ошибка начисления штампа";
    status.value = "error";
    await loadStatus(); // перезагружаем статус
  } finally {
    loading.value = false;
  }
}

// Очистка при пустом поле
watch(username, (newVal) => {
  if (!newVal.trim()) {
    stamps.value = null;
    maxStamps.value = null;
    msg.value = "";
    status.value = "";
    amount.value = 1;
  }
});
</script>

<style scoped>
.stamp-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stamp-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: 24px;
  text-align: center;
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.card-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.form-group {
  margin-bottom: 24px;
}

.input-group {
  display: grid;
  grid-template-columns: 1fr 140px 200px;
  gap: 16px;
  align-items: end;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 20px;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 16px 16px 16px 52px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  color: #1f2937;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.number-input {
  text-align: center;
  padding-left: 16px;
}

.btn-primary {
  padding: 16px 24px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-lg {
  padding: 16px 32px;
}

/* Прогресс */
.progress-section {
  margin: 32px 0;
  padding: 24px;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 16px;
  text-align: center;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
}

.progress-label {
  font-weight: 600;
  color: #4b5563;
}

.progress-count {
  font-weight: 700;
  font-size: 18px;
  color: #6366f1;
}

.progress-bar {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 6px;
  transition: width 0.6s ease;
}

.progress-complete {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.progress-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.progress-dot.filled {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
  transform: scale(1.15);
}

.progress-note {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #10b981;
}

/* Алерт */
.alert {
  padding: 16px 20px;
  border-radius: 12px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease;
}

.alert-success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border: 1px solid #10b981;
  color: #065f46;
}

.alert-error {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1px solid #ef4444;
  color: #991b1b;
}

.alert-info {
  background: linear-gradient(135deg, #e0f2fe, #bae6fd);
  border: 1px solid #0ea5e9;
  color: #0c4a6e;
}

.hint {
  font-size: 14px;
  color: #6b7280;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 12px;
}

/* Иконки */
.icon-stamp::before { content: "🖋️"; }
.icon-user::before { content: "👤"; }
.icon-number::before { content: "#️⃣"; }
.icon-add::before { content: "➕"; }
.icon-info::before { content: "ℹ️"; }
.icon-success::before { content: "✅"; }
.icon-error::before { content: "❌"; }

/* Анимация */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Адаптивность */
@media (max-width: 768px) {
  .input-group {
    grid-template-columns: 1fr;
  }
  .btn-lg {
    width: 100%;
    margin-top: 16px;
  }
}
</style>