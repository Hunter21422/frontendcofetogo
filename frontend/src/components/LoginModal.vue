<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="x" @click="$emit('close')">×</button>

      <div class="title">
        <i class="fa-solid fa-right-to-bracket"></i>
        Войти
      </div>

      <!-- Логин -->
      <label class="lbl"><i class="fa-solid fa-user"></i> Логин</label>
      <div class="input-wrap">
        <input v-model.trim="username" placeholder="Введите логин" autocomplete="username" />
      </div>

      <!-- Пароль -->
      <label class="lbl"><i class="fa-solid fa-lock"></i> Пароль</label>
      <div class="input-wrap">
        <input
          :type="showPass ? 'text' : 'password'"
          v-model="password"
          placeholder="Введите пароль"
          autocomplete="current-password"
        />
        <button
          type="button"
          class="iconbtn"
          @click="showPass = !showPass"
          :aria-label="showPass ? 'Скрыть' : 'Показать'"
        >
          <i class="fa-solid" :class="showPass ? 'fa-eye-slash' : 'fa-eye'"></i>
        </button>
      </div>

      <!-- Бариста -->
      <label class="chk">
        <input type="checkbox" v-model="asBarista" />
        <span><i class="fa-solid fa-user-tie"></i> Я бариста</span>
      </label>

      <transition name="fade">
        <div v-if="asBarista">
          <label class="lbl"><i class="fa-solid fa-id-card-clip"></i> Код сотрудника</label>
          <div class="input-wrap">
            <input
              v-model.trim="employeeCode"
              placeholder="Например: BR-2025-001"
              autocomplete="one-time-code"
            />
          </div>
        </div>
      </transition>

      <p v-if="error" class="error">{{ error }}</p>

      <button class="primary" :disabled="loading" @click="submit">
        <i class="fa-solid fa-arrow-right-to-bracket"></i>
        {{ loading ? 'Входим…' : 'Войти' }}
      </button>

      <div class="switch">
        Нет аккаунта?
        <button class="link" @click="$emit('open-register')">Регистрация</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api, { loginJWT, getMe } from '@/api'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits(['close', 'logged-in', 'open-register'])
const auth = useAuth()

const username = ref('')
const password = ref('')
const asBarista = ref(false)
const employeeCode = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

async function submit () {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'Введите логин и пароль'
    return
  }

  loading.value = true
  try {
    const { data } = await loginJWT({
      username: username.value,
      password: password.value
    })

    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)

    // ✅ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ
    window.dispatchEvent(new Event('auth-changed'))

    try {
      const me = (await getMe()).data
      auth?.setUser?.(me)
    } catch (e) {}

    if (asBarista.value) {
      if (!employeeCode.value) {
        localStorage.removeItem('barista_session')
        error.value = 'Введите код сотрудника'
        loading.value = false
        return
      }
      try {
        await api.post('/api/barista/verify-code/', { code: employeeCode.value })
        localStorage.setItem('barista_session', 'true')
      } catch (e) {
        localStorage.removeItem('barista_session')
        error.value = 'Код сотрудника не принят'
        loading.value = false
        return
      }
    } else {
      localStorage.removeItem('barista_session')
    }

    // ✅ ещё раз, чтобы хедер точно обновился
    window.dispatchEvent(new Event('auth-changed'))

    emit('logged-in')
  } catch (e) {
    error.value =
      e?.response?.data?.detail ||
      e?.response?.data?.error ||
      'Не удалось войти. Проверьте логин/пароль.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:root{
  --green:#1c6b21;
  --green-2:#28a745;
  --ink:#0f172a;
  --muted:#6b7280;
  --border:#e5e7eb;
  --bg:#0b1324a6;
}

/* затемнение фона */
.overlay{
  position:fixed; inset:0; background:var(--bg);
  display:flex; align-items:center; justify-content:center; padding:24px;
  z-index:1000;
}

/* модалка */
.modal{
  width:min(560px,92vw);
  background:#fff; border-radius:16px;
  box-shadow: 0 25px 70px rgba(0,0,0,.25);
  padding:22px 22px 18px; position:relative;
  animation:pop .16s ease-out;
}
@keyframes pop{ from{transform:scale(.98);opacity:.6} to{transform:scale(1);opacity:1} }

.x{
  position:absolute; right:12px; top:10px;
  border:0; background:transparent; font-size:22px; color:#57606a; cursor:pointer;
}
.title{
  font-size:26px; font-weight:800; color:var(--ink);
  display:flex; gap:10px; align-items:center; margin-bottom:12px;
}
.title i{ color:var(--green); }

/* поля */
.lbl{ display:block; font-weight:700; color:#1f2937; margin:10px 0 6px; }
.lbl i{ color:var(--green); margin-right:8px; }

.input-wrap{
  display:flex; align-items:center; gap:8px;
  border:1px solid var(--border); border-radius:12px; padding:10px 12px;
  background:#f8fafc;
}
.input-wrap input{
  border:0; outline:0; background:transparent; width:100%;
  font-size:16px; color:#111827;
}
.iconbtn{
  border:0; background:#111827; color:#fff;
  width:38px; height:38px; border-radius:10px;
  display:grid; place-items:center; cursor:pointer;
}

/* чекбокс */
.chk{ display:flex; align-items:center; gap:10px; margin:12px 0 2px; color:#111827; font-weight:600; }
.chk input{ width:18px; height:18px; accent-color:var(--green); }

/* ошибки */
.error{ color:#c02626; margin:10px 2px 0; }

/* кнопка */
.primary{
  width:100%; margin-top:14px;
  background:#0f172a; color:#fff; border:0; border-radius:12px; padding:14px 16px;
  font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;
}
.primary:disabled{ opacity:.7; cursor:default; }
.primary:hover{ opacity:.92; }

/* переключатель к регистрации */
.switch{ text-align:center; margin-top:10px; color:var(--muted); }
.link{ border:0; background:transparent; color:#2e7d32; font-weight:800; cursor:pointer; margin-left:4px; }

/* плавное появление блока с кодом */
.fade-enter-active,.fade-leave-active{ transition:.15s ease; }
.fade-enter-from,.fade-leave-to{ opacity:0; transform:translateY(-4px); }
</style>
