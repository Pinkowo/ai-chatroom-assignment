<script setup lang="ts">
// No props — renders a fixed thinking indicator
</script>

<template>
  <div class="thinking-row" aria-label="AI is thinking">
    <div class="thinking-row__avatar" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#264D4F"/>
        <path d="M15.9996 16C9.56054 15.9815 11.6313 12.0053 8.00031 12.0001V8C13.5092 8.00801 12.0242 11.9942 15.9996 11.9999V15.9998V16Z" fill="white"/>
        <path d="M20 8H15.9997V11.9999H20V8Z" fill="white"/>
        <path d="M8.00033 11.9999H4V15.9998H8.00033V11.9999Z" fill="white"/>
      </svg>
    </div>
    <div class="thinking-row__bubble">
      <span class="thinking-row__dot" />
      <span class="thinking-row__dot" />
      <span class="thinking-row__dot" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.thinking-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;

  &__avatar {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    margin-top: 6px;
  }

  &__bubble {
    background: var(--bubble-ai);
    border-radius: 0 10px 10px 10px;
    padding: 14px 18px;
    display: inline-flex;
    gap: 5px;
    align-items: center;
  }

  &__dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: $gray-600;
    animation: thinking-dot 1.3s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
}

@keyframes thinking-dot {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.motion-off .thinking-row__dot {
  animation: none;
  opacity: 1;
}
</style>
