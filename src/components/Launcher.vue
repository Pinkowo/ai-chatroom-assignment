<script setup lang="ts">
defineEmits<{ (e: 'toggle'): void }>()
</script>

<template>
  <button
    class="launcher"
    type="button"
    aria-label="Ask Nitra AI"
    @click="$emit('toggle')"
  >
    <i class="fa-solid fa-wand-magic-sparkles launcher__sparkle" aria-hidden="true" />
    <span class="launcher__label">Ask Nitra AI</span>
  </button>
</template>

<style scoped lang="scss">
.launcher {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 25;
  width: 137px;
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border: none;
  background: $orange-400;
  color: #fff;
  font: 600 var(--font-size-sm)/20px 'Inter', sans-serif;
  letter-spacing: 0.005em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.15s, box-shadow 0.2s, filter 0.15s;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
    box-shadow: 0 14px 22px rgba($orange-400, 0.35), 0 4px 6px rgba(0,0,0,0.1);
  }

  &__sparkle {
    font-size: var(--font-size-xs);
    color: #fff;
    flex-shrink: 0;
  }

  &__label {
    white-space: nowrap;
  }
}
</style>
