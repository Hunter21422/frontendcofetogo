<script setup>
import { computed } from "vue";

const props = defineProps({
  count:  { type: [Number, String], default: 0 },
  max:    { type: [Number, String], default: 6 },
  // если нужно «по кругу» (10 при 6 → 4 закрашенных), передай <LoyaltyCard modulo />
  modulo: { type: Boolean, default: false },
});

const maxN = computed(() => Number(props.max ?? 6));
const rawCount = computed(() => Number(props.count ?? 0));

// 10/6: modulo=false → закрасим все 6; modulo=true → 10 % 6 = 4
const filled = computed(() => {
  const c = Number.isFinite(rawCount.value) ? rawCount.value : 0;
  const m = Number.isFinite(maxN.value) ? maxN.value : 6;
  if (m <= 0) return 0;
  return props.modulo ? (c % m) || (c ? m : 0) : Math.min(c, m);
});
</script>

<template>
  <div class="card">
    <div class="row">
      <span
        v-for="n in maxN"
        :key="n"
        :class="['dot', { filled: n <= filled }]"
      >
        {{ n }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff6ed;            /* тёплый фон блока */
  border: 2px solid #6b4b3a;      /* коричневая рамка */
  border-radius: 16px;
  padding: 24px;
}
.row {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.dot {
  width: 48px;
  height: 48px;
  border: 2px dashed #bbb;        /* пунктир, когда пусто */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  background: #fff;
  transition: all .15s ease;
}
.dot.filled {
  border-style: solid;            /* сплошная рамка и заливка у активных */
  border-color: #2e7d32;
  background: #c8f7c5;
}
</style>
