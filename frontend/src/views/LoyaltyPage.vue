<script setup>
import { ref, computed, onMounted } from "vue";
import {
  getUserProfile,        // ← новый импорт
  generateLoyaltyCode,   // ← новый импорт
  resetLoyalty,          // ← новый импорт
} from "@/api";
import LoyaltyCard from "@/components/LoyaltyCard.vue";
import Toast from "@/components/Toast.vue";

const profile = ref({});
const code = ref(null);
const loading = ref(false);
const toast = ref(null);

const username = computed(() => profile.value?.username ?? "");
const stamps = computed(() => Number(profile.value?.stamps ?? 0));
const maxStamps = computed(() => Number(profile.value?.max_stamps ?? 6));

async function loadProfile() {
  try {
    const res = await getUserProfile(); // правильный путь: /api/user/profile/
    profile.value = res.data ?? {};
  } catch (e) {
    console.error("Ошибка загрузки профиля:", e);
    toast.value?.show("Не удалось загрузить данные профиля", "error");
    profile.value = {};
  }
}

async function generateCode() {
  loading.value = true;
  try {
    const res = await generateLoyaltyCode(); // правильный путь: /api/loyalty/generate-code/
    code.value = res.data?.code ?? null;
    toast.value?.show(
      code.value ? "Код успешно сгенерирован" : "Сервер не вернул код",
      code.value ? "success" : "warning"
    );
    await loadProfile();
  } catch (e) {
    toast.value?.show(e?.response?.data?.detail || "Ошибка генерации кода", "error");
  } finally {
    loading.value = false;
  }
}

async function resetStamps() {
  if (!confirm("Сбросить штампы и выдать напиток?")) return;

  loading.value = true;
  try {
    const res = await resetLoyalty(); // правильный путь: /api/loyalty/reset/
    toast.value?.show(res.data?.detail || "Счётчик сброшен", "success");
    await loadProfile();
    code.value = null; // очищаем показанный код
  } catch (e) {
    toast.value?.show(e?.response?.data?.detail || "Не удалось сбросить счётчик", "error");
  } finally {
    loading.value = false;
  }
}

onMounted(loadProfile);
</script>

<template>
  <div>
    <h2>Карта лояльности</h2>
    <p>Пользователь: <b>{{ username }}</b></p>
    <p class="counter">Ваши штампы: {{ stamps }} / {{ maxStamps }}</p>

    <LoyaltyCard :count="stamps" :max="maxStamps" />

    <!-- Сообщение при достижении лимита -->
    <div v-if="stamps >= maxStamps" class="reward-message">
      🎉 Вы достигли лимита штампов!
      Покажите это сообщение баристе, чтобы получить бесплатный напиток ☕
    </div>

    <div class="actions">
      <button
        class="generate-btn"
        @click="generateCode"
        :disabled="loading || stamps >= maxStamps"
      >
        {{ loading ? "Генерирую..." : "Сгенерировать код" }}
      </button>

      <!-- Кнопка сброса -->
      <button
        v-if="stamps >= maxStamps"
        class="reset-btn"
        @click="resetStamps"
        :disabled="loading"
        title="Сбросить штампы после выдачи напитка"
      >
        Я получил напиток
      </button>
    </div>

    <div v-if="code" class="popup">
      <p class="muted">Ваш код:</p>
      <p class="code">{{ code }}</p>
    </div>

    <Toast ref="toast" />
  </div>
</template>

<style scoped>
.counter {
  margin: 6px 0 12px;
  color: #374151;
}
.actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
}

.generate-btn,
.reset-btn {
  padding: 12px 16px;
  border: 0;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.generate-btn {
  background: #3b82f6;
  color: #fff;
}
.generate-btn:disabled {
  background: #a3a3a3;
  cursor: not-allowed;
}

.reset-btn {
  background: #10b981;
  color: #fff;
}
.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reward-message {
  margin-top: 16px;
  background: #e8f5e9;
  color: #1b5e20;
  border: 2px solid #2e7d32;
  border-radius: 12px;
  padding: 14px 18px;
  font-weight: 600;
  text-align: center;
}

.popup {
  margin-top: 20px;
  padding: 16px;
  border: 2px solid #ccc;
  border-radius: 10px;
  background: #fff;
  text-align: center;
}
.code {
  font-size: 32px;
  font-weight: 800;
  margin: 12px 0;
}
.muted {
  font-size: 14px;
  color: #6b7280;
}
</style>