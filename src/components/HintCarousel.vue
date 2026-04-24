<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Hint {
  icon: string
  text: string
}

defineProps<{
  hasMessages: boolean
  motionOff?: boolean
}>()

const emit = defineEmits<{ (e: 'select', text: string): void }>()

const HINTS: Hint[] = [
  { icon: 'fa-regular fa-rectangle-list',   text: 'Upload your supplier list' },
  { icon: 'fa-solid fa-cart-shopping',       text: 'Check if Avastin is in stock' },
  { icon: 'fa-solid fa-hand-holding-dollar', text: 'Check if there\'s a better price for Xeomin' },
  { icon: 'fa-solid fa-magnifying-glass',    text: 'What are some generic options for Restylane' },
  { icon: 'fa-solid fa-thumbs-up',           text: 'What\'s the best product for Xeomin' },
]

const activeIdx = ref(0)
const isExiting = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

function advance(motionOff: boolean): void {
  if (motionOff) {
    activeIdx.value = (activeIdx.value + 1) % HINTS.length
    return
  }
  // Exit current, then swap and enter
  isExiting.value = true
  setTimeout(() => {
    activeIdx.value = (activeIdx.value + 1) % HINTS.length
    isExiting.value = false
  }, 450)
}

onMounted(() => {
  timer = setInterval(() => advance(false), 2500)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function onHintClick(text: string): void {
  emit('select', text)
}
</script>

<template>
  <div
    v-show="!hasMessages"
    class="hint-carousel"
    aria-live="polite"
  >
    <div
      v-for="(hint, idx) in HINTS"
      :key="hint.text"
      class="hint-item"
      :class="{
        'hint-item--active': idx === activeIdx && !isExiting,
        'hint-item--exit': idx === activeIdx && isExiting,
      }"
    >
      <i :class="hint.icon" class="hint-item__icon" aria-hidden="true" />
      <span
        class="hint-item__text"
        role="button"
        :tabindex="idx === activeIdx ? 0 : -1"
        :aria-label="`Suggested question: ${hint.text}`"
        @click="onHintClick(hint.text)"
        @keydown.enter="onHintClick(hint.text)"
      >{{ hint.text }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hint-carousel {
  margin-top: auto;
  height: 33px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.hint-item {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font: 400 var(--font-size-sm)/17px 'Inter', sans-serif;
  color: $gray-700;
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.45s ease, transform 0.45s ease;
  pointer-events: none;

  &--active {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  &--exit {
    opacity: 0;
    transform: translateY(-22px);
  }

  &__icon {
    color: $teal-300;
    font-size: var(--font-size-md);
    width: 16px;
    text-align: center;
    flex-shrink: 0;
  }

  &__text {
    cursor: pointer;

    &:hover {
      color: $teal-700;
    }
  }
}

.motion-off .hint-item {
  transition: none;
}
</style>
