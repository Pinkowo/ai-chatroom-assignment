<script setup lang="ts">
defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <header class="chat-header">
    <span class="chat-header__emblem" aria-hidden="true">
      <svg width="46" height="23" viewBox="0 0 46 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M34.4991 23C15.9867 22.9468 21.9402 11.5151 11.501 11.5002V0C27.339 0.0230158 23.0696 11.4835 34.4991 11.4998V22.9995V23Z" fill="white"/>
        <path d="M46 0H34.499V11.4998H46V0Z" fill="white"/>
        <path d="M11.501 11.4998H0V22.9995H11.501V11.4998Z" fill="white"/>
      </svg>
    </span>
    <div class="chat-header__titles">
      <div class="chat-header__title-row">
        <h1 class="chat-header__h1">Nitra AI</h1>
        <i class="fa-solid fa-wand-magic-sparkles chat-header__wand" aria-hidden="true" />
      </div>
      <div class="chat-header__subtitle">Hi there, How can we help?</div>
    </div>
    <div class="chat-header__actions">
      <button
        class="chat-header__close-btn"
        type="button"
        title="Close"
        aria-label="Close"
        @click="$emit('close')"
      >
        <i class="fa-solid fa-xmark" aria-hidden="true" />
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.chat-header {
  background: $teal-700;
  color: #fff;
  padding: 18px 20px;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-radius: 8px 8px 0 0;
  flex-shrink: 0;

  &__emblem {
    width: 46px;
    height: 23px;
    margin-top: 7px;
    flex-shrink: 0;
    display: inline-block;
  }

  &__titles {
    flex: 1;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__h1 {
    margin: 0;
    font: 700 30px/1 'Source Sans 3', 'Source Sans Pro', sans-serif;
    color: #fff;
    letter-spacing: -0.005em;
  }

  &__wand {
    font-size: 24px;
    color: #fff;
    opacity: 0.95;
  }

  &__subtitle {
    margin-top: 4px;
    font: 400 16px/1.5 'Source Sans 3', 'Source Sans Pro', sans-serif;
    color: #fff;
  }

  &__actions {
    position: absolute;
    top: 14px;
    right: 14px;
    display: flex;
    gap: 2px;
  }

  &__close-btn {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: #fff;
    opacity: 0.85;
    cursor: pointer;
    display: grid;
    place-items: center;
    font-size: 16px;
    transition: background 0.15s, opacity 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      opacity: 1;
    }
  }
}

@media (max-width: 480px) {
  .chat-header {
    &__emblem {
      width: 38px;
      height: 19px;
    }

    &__h1 {
      font-size: 22px;
    }

    &__subtitle {
      font-size: 14px;
    }
  }
}
</style>
