<template>
  <transition name="slide-up">
    <div v-if="visible" class="toast" :class="typeCls">
      <span class="dot" />
      <span>{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from "vue";
let timer = null;

const visible = ref(false);
const message = ref("");
const type = ref("info"); // 'success' | 'error' | 'info'

function show(msg, t = "info", ms = 2000) {
  message.value = msg;
  type.value = t;
  visible.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => (visible.value = false), ms);
}

const typeCls = computed(() => ({
  success: type.value === "success",
  error: type.value === "error",
  info: type.value === "info",
}));

defineExpose({ show });
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #111827;
  color: #fff;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
.toast.success {
  background: #16a34a;
}
.toast.error {
  background: #dc2626;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.9;
}
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
